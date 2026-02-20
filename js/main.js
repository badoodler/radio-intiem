// Radio Intiem - Vanilla JavaScript
// Pure JavaScript without build tools

let RADIO_STREAM_URL = 'https://server6.radio-streams.net/proxy/uhbkoydi/stream';

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

// ─── Content rendering ───────────────────────────────────────────────────────

function applyContent(c) {
  // Site-level
  if (c.site) {
    document.title = c.site.title || document.title;
    RADIO_STREAM_URL = c.site.streamUrl || RADIO_STREAM_URL;
    setText('.broadcast-text:first-child', c.site.tagline);
    setText('.broadcast-info .broadcast-text:last-child', c.site.subtitle);
    setText('.freq-value', c.site.frequency);
  }

  // Nav
  if (c.nav) renderNav(c.nav);

  // History
  if (c.history) renderHistory(c.history);

  // Schedule
  if (c.schedule) renderSchedule(c.schedule);

  // Team
  if (c.team) renderTeam(c.team);

  // Photos
  if (c.photos) renderPhotos(c.photos);

  // Contact
  if (c.contact) renderContact(c.contact);
}

function setText(selector, value) {
  if (value == null) return;
  var el = document.querySelector(selector);
  if (el) el.innerHTML = value;
}

function renderNav(navItems) {
  var list = document.getElementById('nav-menu');
  if (!list) return;
  list.innerHTML = navItems.map(function(item) {
    return '<li><a href="' + item.href + '" class="nav-link">' + item.label + '</a></li>';
  }).join('');
}

function renderHistory(history) {
  var section = document.getElementById('geschiedenis');
  if (!section) return;

  var heading = section.querySelector('h2');
  if (heading) heading.textContent = history.title;

  // Story blocks
  var storyContainer = section.querySelector('.history-story');
  if (storyContainer && history.blocks) {
    storyContainer.innerHTML = history.blocks.map(function(block) {
      var html = '<div class="story-block"><h3>' + block.heading + '</h3>';

      if (block.paragraphs) {
        block.paragraphs.forEach(function(p) {
          html += '<p>' + p + '</p>';
        });
      }
      if (block.quote) {
        html += '<div class="quote">' + block.quote + '</div>';
      }
      if (block.djList) {
        html += '<div class="dj-list"><p>' + block.djList + '</p></div>';
      }
      if (block.note) {
        html += '<div class="note">' + block.note + '</div>';
      }

      html += '</div>';
      return html;
    }).join('');
  }

  // Timeline
  var timeline = section.querySelector('.timeline');
  if (timeline && history.timeline) {
    timeline.innerHTML = history.timeline.map(function(entry) {
      var items = (entry.items || []).map(function(i) {
        return '<li>' + i + '</li>';
      }).join('');
      return '<div class="timeline-item">' +
        '<div class="timeline-year">' + entry.year + '</div>' +
        '<div class="timeline-content"><h3>' + entry.heading + '</h3>' +
        '<ul>' + items + '</ul></div></div>';
    }).join('');
  }
}

function renderSchedule(schedule) {
  var section = document.getElementById('uitzenddagen');
  if (!section) return;

  var heading = section.querySelector('h2');
  if (heading) heading.textContent = schedule.title;

  var container = section.querySelector('.schedule-container');
  if (!container || !schedule.days) return;

  // Keep the footer element if present, rebuild everything else
  var footer = container.querySelector('.schedule-footer');
  container.innerHTML = '';

  schedule.days.forEach(function(day) {
    var headerHtml = '<div class="schedule-header">' +
      '<h3>' + day.heading + '</h3>' +
      '<p class="schedule-subtitle">' + day.subtitle + '</p>' +
      '</div>';

    var itemsHtml = '<div class="schedule-grid">' +
      day.items.map(function(item) {
        return '<div class="schedule-item">' +
          '<div class="time-slot">' + item.time + '</div>' +
          '<div class="program-info"><h4 class="program-title">' + item.title + '</h4></div>' +
          '</div>';
      }).join('') +
      '</div>';

    container.innerHTML += headerHtml + itemsHtml;
  });

  // Rebuild footer
  if (schedule.footer) {
    var listenOn = (schedule.footer.listenOn || []).map(function(v) {
      return '<span class="frequency-value">' + v + '</span>';
    }).join('');
    var broadcastTimes = (schedule.footer.broadcastTimes || []).map(function(v) {
      return '<span class="broadcast-time">' + v + '</span>';
    }).join('');

    container.innerHTML +=
      '<div class="schedule-footer">' +
        '<div class="frequency-info">' +
          '<span class="frequency-label">Luister op:</span>' + listenOn +
        '</div>' +
        '<div class="broadcast-info">' +
          '<span class="broadcast-label"></span>' + broadcastTimes +
        '</div>' +
      '</div>';
  }
}

function renderTeam(team) {
  var section = document.getElementById('dj-s');
  if (!section) return;

  var heading = section.querySelector('h2');
  if (heading) heading.textContent = team.title;

  var grid = section.querySelector('.dj-grid');
  if (!grid || !team.members) return;

  grid.innerHTML = team.members.map(function(member, i) {
    var photoHtml = member.photo
      ? '<div class="dj-photo"><img src="' + member.photo + '" alt="' + member.name + '" /></div>'
      : '<div class="dj-photo dj-photo-placeholder" data-dj="' + (i + 1) + '">' +
          '<span class="dj-placeholder-text">' + (member.initial || member.name[0]) + '</span>' +
        '</div>';

    var scheduleHtml = (member.scheduleDay && member.scheduleTime)
      ? '<div class="dj-schedule">' +
          '<span class="schedule-label">' + member.scheduleDay + ':</span>' +
          '<span class="schedule-time">' + member.scheduleTime + '</span>' +
        '</div>'
      : '';

    var descriptionHtml = member.description
      ? '<p class="dj-description">' + member.description + '</p>'
      : '';

    return '<div class="dj-card">' +
      photoHtml +
      '<div class="dj-info">' +
        '<h3 class="dj-name">' + member.name + '</h3>' +
        '<p class="dj-specialty">' + member.specialty + '</p>' +
        descriptionHtml +
        scheduleHtml +
      '</div>' +
    '</div>';
  }).join('');
}

function renderPhotos(photos) {
  var grid = document.querySelector('#fotoalbum .photo-grid');
  if (!grid) return;

  grid.innerHTML = photos.map(function(photo) {
    return '<div class="photo-item" data-image="' + photo.src + '">' +
      '<img src="' + photo.src + '" alt="' + photo.alt + '" loading="lazy" />' +
    '</div>';
  }).join('');
}

function renderContact(contact) {
  var section = document.getElementById('contact');
  if (!section) return;

  var heading = section.querySelector('h2');
  if (heading) heading.textContent = contact.title;

  var container = section.querySelector('.contact-container');
  if (!container) return;

  var emailBlock = contact.email
    ? '<div class="email-item">' +
        '<div class="email-icon">📧</div>' +
        '<div class="email-details">' +
          '<h4>' + contact.email.label + '</h4>' +
          '<a href="mailto:' + contact.email.address + '" class="email-link">' + contact.email.address + '</a>' +
        '</div>' +
      '</div>'
    : '';

  var mytunerBlock = contact.mytuner
    ? '<div class="contact-container"><div class="contact-info">' +
        '<h3>' + contact.mytuner.heading + '</h3>' +
        '<p class="contact-description">' + contact.mytuner.description + '</p>' +
        '<div class="email-info"><div class="email-item"><div class="email-details">' +
          '<h4>URL:</h4>' +
          '<a href="' + contact.mytuner.url + '" class="email-link">' + contact.mytuner.urlLabel + '</a>' +
        '</div></div></div>' +
      '</div></div>'
    : '';

  container.innerHTML =
    '<div class="contact-info">' +
      '<h3>' + contact.heading + '</h3>' +
      '<p class="contact-description">' + contact.description + '</p>' +
      '<div class="email-info">' + emailBlock + '</div>' +
    '</div>' +
    mytunerBlock;
}

// ─── Initialize ──────────────────────────────────────────────────────────────

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  fetch('contents.json')
    .then(function(res) { return res.json(); })
    .then(function(data) { init(data); })
    .catch(function(err) {
      console.error('Could not load contents.json:', err);
      init(null);
    });
});

function init(content) {
  if (content) {
    applyContent(content);
  }
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
