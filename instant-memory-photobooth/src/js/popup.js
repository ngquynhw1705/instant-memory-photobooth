// Feature Update Popup Handler
// This script manages the feature popup display, dismissal, and localStorage persistence

;(() => {
  const POPUP_DELAY = 1500 // Delay before showing popup (ms)

  // DOM Elements
  const popup = document.getElementById("featurePopup")
  const closeBtn = document.getElementById("closePopup")
  const dismissBtn = document.getElementById("dismissPopup")
  const overlay = document.getElementById("popupOverlay")

  // Import confetti library
  const confetti = window.confetti || undefined

  function triggerConfetti() {
    if (typeof confetti !== "undefined") {
      // Burst from center
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"],
      })

      // Extra burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 90,
          origin: { y: 0.6 },
        })
      }, 250)
    }
  }

  // Dismiss the popup
  function dismissPopup() {
    if (popup) {
      popup.classList.add("hidden")
      // console.log("[v0] Popup dismissed")
    }
  }

  // Show the popup
  function showPopup() {
    if (popup) {
      // Use setTimeout to delay popup appearance
      setTimeout(() => {
        popup.classList.remove("hidden")
        triggerConfetti()
        // console.log("[v0] Popup displayed")
      }, POPUP_DELAY)
    }
  }

  // Event Listeners
  if (closeBtn) closeBtn.addEventListener("click", dismissPopup)
  if (dismissBtn) dismissBtn.addEventListener("click", dismissPopup)
  if (overlay) overlay.addEventListener("click", dismissPopup)

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showPopup)
  } else {
    showPopup()
  }

  // Expose reset function for testing (optional)
  window.resetFeaturePopup = () => {
    popup.classList.add("hidden")
    // console.log("[v0] Popup reset")
  }
})()
