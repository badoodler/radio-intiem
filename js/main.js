// Radio Intiem - Vanilla JavaScript
// Pure JavaScript without build tools

const RADIO_STREAM_URL = 'https://server6.radio-streams.net/proxy/uhbkoydi/stream';

// State
let isPlaying = false;
let volume = 100;
let isLoading = false;
let hasError = false;
let streamAvailable = false;
let selectedImage = null;

// DOM Elements
let audio;
let playBtn;
let volumeSlider;
let volumeValue;
let liveDot;
let liveText;
let signalIndicator;
let errorIndicator;
let imageModal;
let modalImage;
let modalCloseBtn;
let hamburgerBtn;
let navMenu;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Get DOM elements
  audio = document.getElementById('audio-player');
  playBtn = document.getElementById('play-btn');
  volumeSlider = document.getElementById('volume-slider');
  volumeValue = document.getElementById('volume-value');
  liveDot = document.getElementById('live-dot');
  liveText = document.getElementById('live-text');
  signalIndicator = document.getElementById('signal-indicator');
  errorIndicator = document.getElementById('error-indicator');
  imageModal = document.getElementById('image-modal');
  modalImage = document.getElementById('modal-image');
  modalCloseBtn = document.getElementById('modal-close-btn');
  hamburgerBtn = document.getElementById('hamburger-btn');
  navMenu = document.getElementById('nav-menu');

  // Setup event listeners
  setupAudioListeners();
  setupPlayerControls();
  setupPhotoAlbum();
  setupModal();
  setupMobileMenu();

  // Check stream availability
  checkStreamAvailability();

  // Check stream every 30 seconds
  setInterval(checkStreamAvailability, 30000);
}

// Stream availability check
async function checkStreamAvailability() {
  try {
    const testAudio = new Audio();
    testAudio.crossOrigin = 'anonymous';
    testAudio.preload = 'none';

    const available = await new Promise(function(resolve) {
      const timeout = setTimeout(function() {
        resolve(false);
      }, 5000);

      function handleCanPlay() {
        clearTimeout(timeout);
        resolve(true);
      }

      function handleError() {
        clearTimeout(timeout);
        resolve(false);
      }

      testAudio.addEventListener('canplay', handleCanPlay, { once: true });
      testAudio.addEventListener('error', handleError, { once: true });

      testAudio.src = RADIO_STREAM_URL;
      testAudio.load();
    });

    setStreamAvailable(available);
  } catch (error) {
    console.error('Error checking stream availability:', error);
    setStreamAvailable(false);
  }
}

function setStreamAvailable(available) {
  streamAvailable = available;
  updateUI();
}

// Audio event listeners
function setupAudioListeners() {
  audio.addEventListener('loadstart', function() {
    isLoading = true;
    updateUI();
  });

  audio.addEventListener('canplay', function() {
    isLoading = false;
    hasError = false;
    streamAvailable = true;
    updateUI();
  });

  audio.addEventListener('error', function() {
    isLoading = false;
    hasError = true;
    isPlaying = false;
    streamAvailable = false;
    updateUI();
  });

  audio.addEventListener('play', function() {
    isPlaying = true;
    updateUI();
  });

  audio.addEventListener('pause', function() {
    isPlaying = false;
    updateUI();
  });
}

// Player controls
function setupPlayerControls() {
  // Play/Pause button
  playBtn.addEventListener('click', togglePlayPause);

  // Volume slider
  volumeSlider.addEventListener('input', handleVolumeChange);
}

async function togglePlayPause() {
  try {
    if (isPlaying) {
      audio.pause();
    } else {
      if (audio.src !== RADIO_STREAM_URL) {
        audio.src = RADIO_STREAM_URL;
      }
      await audio.play();
    }
  } catch (error) {
    console.error('Error playing audio:', error);
    hasError = true;
    isPlaying = false;
    updateUI();
  }
}

function handleVolumeChange(e) {
  volume = parseInt(e.target.value);
  audio.volume = volume / 100;
  volumeValue.textContent = volume + '%';
}

// Photo album
function setupPhotoAlbum() {
  const photoItems = document.querySelectorAll('.photo-item');

  photoItems.forEach(function(item) {
    item.addEventListener('click', function() {
      const imageSrc = item.dataset.image;
      openModal(imageSrc);
    });
  });
}

// Modal
function setupModal() {
  // Close button
  modalCloseBtn.addEventListener('click', closeModal);

  // Click outside to close
  imageModal.addEventListener('click', function(e) {
    if (e.target === imageModal) {
      closeModal();
    }
  });

  // Prevent click on content from closing
  const modalContent = imageModal.querySelector('.image-modal-content');
  modalContent.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  // ESC key to close
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && selectedImage) {
      closeModal();
    }
  });
}

function openModal(imageSrc) {
  selectedImage = imageSrc;
  modalImage.src = imageSrc;
  imageModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  selectedImage = null;
  imageModal.style.display = 'none';
  document.body.style.overflow = '';
}

// Mobile Menu
function setupMobileMenu() {
  // Toggle menu
  hamburgerBtn.addEventListener('click', function() {
    hamburgerBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when clicking a link
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      hamburgerBtn.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      if (navMenu.classList.contains('active')) {
        hamburgerBtn.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });

  // Close menu on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      hamburgerBtn.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// Update UI based on state
function updateUI() {
  // Play button
  if (isLoading) {
    playBtn.textContent = '⏳';
    playBtn.disabled = true;
  } else if (isPlaying) {
    playBtn.textContent = '⏸';
    playBtn.disabled = false;
  } else {
    playBtn.textContent = '▶';
    playBtn.disabled = !streamAvailable;
  }

  // Live indicator
  if (streamAvailable) {
    liveDot.classList.remove('offline');
    liveDot.classList.add('live');
    liveText.textContent = 'LIVE';
    liveText.style.color = '#ff4444';
  } else {
    liveDot.classList.remove('live');
    liveDot.classList.add('offline');
    liveText.textContent = 'OFFLINE';
    liveText.style.color = '#666';
  }

  // Signal indicator
  if (streamAvailable) {
    signalIndicator.classList.remove('offline-indicator');
    signalIndicator.innerHTML =
      '<div class="signal-bar"></div>' +
      '<div class="signal-bar"></div>' +
      '<div class="signal-bar"></div>' +
      '<div class="signal-bar"></div>' +
      '<div class="signal-bar"></div>';
  } else {
    signalIndicator.classList.add('offline-indicator');
    signalIndicator.innerHTML = '<span class="offline-cross">✕</span>';
  }

  // Error indicator
  if (hasError) {
    errorIndicator.style.display = 'flex';
  } else {
    errorIndicator.style.display = 'none';
  }

  // Volume slider
  volumeSlider.disabled = isLoading;
}
