;(() => {
  // =============================================
  // ĐẾM THỜI GIAN ĐÃ TRÔI QUA TỪ NGÀY 17/05/2026
  // =============================================

  // Ngày bắt đầu: 17/05/2026
  // Lưu ý: trong JavaScript, tháng 5 là số 4 vì tháng bắt đầu từ 0
  const launchDate = new Date(2026, 4, 17, 0, 0, 0).getTime()

  const daysElement = document.getElementById("days")
  const hoursElement = document.getElementById("hours")
  const minutesElement = document.getElementById("minutes")
  const secondsElement = document.getElementById("seconds")
  const titleElement = document.getElementById("countdown-title")

  if (titleElement) {
    titleElement.textContent = "EST. MAY 17, 2026"
  }

  function updateLiveSince() {
    const now = new Date().getTime()
    const elapsed = now - launchDate

    // Nếu chưa tới ngày 17/05/2026 thì hiện 00
    if (elapsed < 0) {
      if (daysElement) daysElement.textContent = "00"
      if (hoursElement) hoursElement.textContent = "00"
      if (minutesElement) minutesElement.textContent = "00"
      if (secondsElement) secondsElement.textContent = "00"
      return
    }

    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24))
    const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000)

    if (daysElement) daysElement.textContent = String(days).padStart(2, "0")
    if (hoursElement) hoursElement.textContent = String(hours).padStart(2, "0")
    if (minutesElement) minutesElement.textContent = String(minutes).padStart(2, "0")
    if (secondsElement) secondsElement.textContent = String(seconds).padStart(2, "0")
  }

  updateLiveSince()
  setInterval(updateLiveSince, 1000)
})()