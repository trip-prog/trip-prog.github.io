/* ============================================================
   Нейро-ассистент — встраиваемый чат-виджет (vanilla JS).
   Работает в двух режимах:
   • real — если доступен бэкенд (POST {endpoint}/chat) с настроенной нейросетью;
   • demo — иначе: поиск ответа по базе знаний прямо в браузере (без сервера).
   Настройка: window.NEURO_ASSISTANT = { endpoint, kb, title, greeting, chips }
   ============================================================ */
(() => {
  const cfg = Object.assign(
    {
      endpoint: '/api',
      kb: 'kb.json',
      title: 'Ассистент студии trip-prog',
      subtitle: 'на связи',
      greeting:
        'Здравствуйте! 👋 Я — ИИ-ассистент студии trip-prog. Спрошу что угодно про услуги, цены и сроки — отвечу по делу.',
      chips: ['Сколько стоит сайт?', 'Какие сроки?', 'Как проходит работа?', 'Что вы делаете?'],
      autoOpenDelay: 2600,
    },
    window.NEURO_ASSISTANT || {},
  )

  let mode = 'demo' // определится после health-check
  let kb = []
  const history = []
  let busy = false

  /* ---------- утилиты ---------- */
  const esc = (s) =>
    s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  const linkify = (s) =>
    esc(s)
      .replace(/\b(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/\b([\w.+-]+@[\w-]+\.[\w.-]+)\b/g, '<a href="mailto:$1">$1</a>')
  const norm = (s) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9\s]/gi, ' ')
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  /* ---------- демо-режим: лексический поиск по базе ---------- */
  const STOP = new Set('и в во на с со по а у же ли бы как что это все вы мне я о об от до за из к но или ваш наш мой моим свой это'.split(' '))
  const GREET = ['привет', 'здравствуй', 'здравствуйте', 'добрый день', 'доброе утро', 'добрый вечер', 'хай', 'ку']
  const THANKS = ['спасибо', 'благодарю', 'спс', 'пасибо']

  // Группы синонимов: слова внутри одной группы считаются взаимозаменяемыми при поиске.
  // Это связывает вопрос клиента с нужным разделом («стоит» → раздел «Цены»).
  const SYN = [
    ['цена', 'цены', 'стоит', 'стоить', 'стоимость', 'ценник', 'почем', 'прайс', 'бюджет', 'сколько', 'дорого', 'дешево'],
    ['срок', 'сроки', 'когда', 'быстро', 'долго', 'время', 'дедлайн', 'успеете'],
    ['город', 'регион', 'регионы', 'регионами', 'удаленно', 'удаленный', 'находитесь', 'откуда', 'страна', 'россия'],
    ['оплата', 'оплатить', 'платить', 'предоплата', 'рассрочка', 'аванс', 'счет', 'чек'],
    ['услуги', 'услуга', 'делаете', 'делаю', 'умеете', 'можете', 'специализация', 'занимаетесь'],
    ['правки', 'правка', 'исправить', 'доработать', 'изменить', 'переделать'],
    ['домен', 'хостинг', 'разместить', 'опубликовать', 'сервер', 'выложить'],
    ['текст', 'тексты', 'копирайтинг', 'контент', 'наполнение'],
    ['гарантия', 'гарантии', 'поддержка', 'сопровождение', 'баг', 'баги', 'багов'],
    ['телеграм', 'telegram', 'бот', 'боты'],
    ['магазин', 'товары', 'корзина', 'ecommerce'],
    ['контакт', 'контакты', 'связаться', 'написать', 'почта', 'емейл'],
  ]

  function termsOf(text) {
    return norm(text)
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOP.has(w))
  }
  // Совпадение по основе слова: сравниваем общий префикс, отбрасывая до 2 последних
  // букв (русские окончания). Так «гарантию»↔«гарантии», «услуга»↔«услуги», «срок»↔«сроки».
  const wordMatch = (a, b) => {
    const k = Math.min(a.length, b.length)
    if (k < 4) return false
    const p = Math.max(4, k - 2)
    return a.slice(0, p) === b.slice(0, p)
  }
  // Множество слов для сопоставления с термином: сам термин + его синонимы
  function expand(term) {
    const group = SYN.find((g) => g.some((w) => wordMatch(w, term)))
    return group ? [term, ...group] : [term]
  }

  function demoAnswer(question) {
    const q = norm(question).trim()
    if (GREET.some((g) => q.startsWith(g)))
      return { answer: cfg.greeting + '\n\nЧто вас интересует?', sources: [] }
    if (THANKS.some((t) => q.includes(t)))
      return { answer: 'Пожалуйста! Если появятся ещё вопросы — я рядом. А обсудить проект можно на почте tripolev04@gmail.com 🙂', sources: [] }

    const qt = [...new Set(termsOf(question))].map((t) => expand(t))
    let best = null
    for (const chunk of kb) {
      const titleWords = termsOf(chunk.title)
      const textWords = termsOf(chunk.text)
      let score = 0
      for (const variants of qt) {
        const inTitle = titleWords.some((w) => variants.some((v) => wordMatch(w, v)))
        if (inTitle) score += 3
        const hits = textWords.filter((w) => variants.some((v) => wordMatch(w, v))).length
        if (hits) score += Math.min(hits, 3)
      }
      if (!best || score > best.score) best = { chunk, score }
    }

    if (!best || best.score < 2) {
      return {
        answer:
          'Хороший вопрос — уточню деталь у разработчика, чтобы не ошибиться. Напишите, пожалуйста, напрямую на tripolev04@gmail.com, отвечу быстро. А пока могу рассказать про услуги, цены, сроки и как проходит работа.',
        sources: [],
      }
    }
    return { answer: best.chunk.text, sources: [best.chunk.title] }
  }

  /* ---------- реальный режим: запрос к бэкенду ---------- */
  async function realAnswer(question) {
    const res = await fetch(cfg.endpoint + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question, history: history.slice(-6) }),
    })
    if (!res.ok) throw new Error('bad status ' + res.status)
    return res.json()
  }

  /* ---------- построение DOM ---------- */
  const root = document.createElement('div')
  root.className = 'na-root'
  root.innerHTML = `
    <div class="na-panel" role="dialog" aria-label="Чат с ассистентом">
      <div class="na-header">
        <div class="na-avatar">🤖</div>
        <div>
          <div class="na-title">${esc(cfg.title)}</div>
          <div class="na-status">${esc(cfg.subtitle)}</div>
        </div>
        <button class="na-header-x" aria-label="Свернуть">✕</button>
      </div>
      <div class="na-messages"></div>
      <div class="na-chips"></div>
      <div class="na-input">
        <textarea rows="1" placeholder="Напишите вопрос…" aria-label="Сообщение"></textarea>
        <button class="na-send" aria-label="Отправить">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </button>
      </div>
      <div class="na-foot">на базе нейросети · <b>trip-prog</b></div>
    </div>
    <button class="na-launcher" aria-label="Открыть чат">
      <svg class="na-chat-ico" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.9 8.4 8.5 8.5 0 0 1-3.9-.9L3 20l1.4-4.2a8.4 8.4 0 0 1-1-4A8.38 8.38 0 0 1 21 11.5z"/></svg>
      <svg class="na-close-ico" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>`
  document.body.appendChild(root)

  const $panel = root.querySelector('.na-panel')
  const $messages = root.querySelector('.na-messages')
  const $chips = root.querySelector('.na-chips')
  const $textarea = root.querySelector('textarea')
  const $send = root.querySelector('.na-send')
  const $launcher = root.querySelector('.na-launcher')

  /* ---------- рендер сообщений ---------- */
  function addMessage(role, text, sources) {
    const el = document.createElement('div')
    el.className = 'na-msg ' + (role === 'user' ? 'user' : 'bot')
    el.innerHTML = role === 'user' ? esc(text) : linkify(text)
    $messages.appendChild(el)
    if (sources && sources.length) {
      const s = document.createElement('div')
      s.className = 'na-sources'
      s.textContent = 'из раздела: ' + sources.join(', ')
      $messages.appendChild(s)
    }
    $messages.scrollTop = $messages.scrollHeight
  }

  function showTyping() {
    const t = document.createElement('div')
    t.className = 'na-typing'
    t.innerHTML = '<span></span><span></span><span></span>'
    $messages.appendChild(t)
    $messages.scrollTop = $messages.scrollHeight
    return t
  }

  function renderChips() {
    $chips.innerHTML = ''
    if (history.length > 0) return // показываем только в начале диалога
    cfg.chips.forEach((c) => {
      const b = document.createElement('button')
      b.className = 'na-chip'
      b.textContent = c
      b.onclick = () => submit(c)
      $chips.appendChild(b)
    })
  }

  /* ---------- отправка ---------- */
  async function submit(text) {
    const question = (text ?? $textarea.value).trim()
    if (!question || busy) return
    busy = true
    $send.disabled = true
    $textarea.value = ''
    $textarea.style.height = 'auto'
    addMessage('user', question)
    history.push({ role: 'user', content: question })
    renderChips()

    const typing = showTyping()
    try {
      let result
      if (mode === 'real') {
        result = await realAnswer(question)
      } else {
        await sleep(500 + Math.random() * 500) // лёгкая имитация «печатает»
        result = demoAnswer(question)
      }
      typing.remove()
      addMessage('bot', result.answer, result.sources)
      history.push({ role: 'assistant', content: result.answer })
    } catch (e) {
      typing.remove()
      // Если реальный бэкенд отвалился — мягко переходим на демо
      if (mode === 'real') {
        mode = 'demo'
        const r = demoAnswer(question)
        addMessage('bot', r.answer, r.sources)
        history.push({ role: 'assistant', content: r.answer })
      } else {
        addMessage('bot', 'Что-то пошло не так. Попробуйте ещё раз или напишите на tripolev04@gmail.com')
      }
    } finally {
      busy = false
      $send.disabled = false
      $textarea.focus()
    }
  }

  /* ---------- открытие/закрытие ---------- */
  let opened = false
  function open() {
    root.classList.add('na-open')
    if (!opened) {
      opened = true
      addMessage('bot', cfg.greeting)
      renderChips()
    }
    setTimeout(() => $textarea.focus(), 300)
  }
  const close = () => root.classList.remove('na-open')
  const toggle = () => (root.classList.contains('na-open') ? close() : open())

  $launcher.onclick = toggle
  root.querySelector('.na-header-x').onclick = close
  $send.onclick = () => submit()
  $textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  })
  $textarea.addEventListener('input', () => {
    $textarea.style.height = 'auto'
    $textarea.style.height = Math.min($textarea.scrollHeight, 96) + 'px'
  })

  /* ---------- инициализация ---------- */
  async function init() {
    // 1) грузим базу знаний для демо-режима
    try {
      const res = await fetch(cfg.kb)
      if (res.ok) kb = await res.json()
    } catch { /* нет kb.json — демо ответит общими фразами */ }

    // 2) проверяем, есть ли живой бэкенд с настроенной нейросетью
    try {
      const res = await fetch(cfg.endpoint + '/health', { signal: AbortSignal.timeout(2500) })
      if (res.ok) {
        const h = await res.json()
        if (h.assistant) mode = 'real'
      }
    } catch { /* бэкенда нет — остаёмся в демо-режиме */ }

    if (cfg.autoOpenDelay >= 0) setTimeout(() => { if (!opened) open() }, cfg.autoOpenDelay)
  }
  init()
})()
