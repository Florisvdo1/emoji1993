/*
  app.js 
  Implements new refinements:
    - Left/right carousel behind center
    - Arcade claw handle (scroll)
    - Double-tap deletion in placeholders
    - Homework button => confetti once toggled on => Good Job! 🎉
    - Extended event categories for kids 3-12 (plus more event emojis)
    - iOS continuous haptics + fast vibrate + zoom on drop
    - etc.
*/

////////////////////////////////////////////
// Data
////////////////////////////////////////////
let layout = {
  morning: [null, null, null, null],
  midday:  [null, null, null, null],
  evening: [null, null, null, null]
};

// Event categories for kids 3-12 & more
const categories = [
  {
    name: "Running / Sports",
    emojis: ["🏃🏻‍♂️","⚽","🏀","🏐","🏓","🏸","🥏","🤸","🤾","🏊‍♀️","🏋️‍♀️","🚴","⚾"]
  },
  {
    name: "Schedules / Planning",
    emojis: ["🗓️","📅","🕒","⏰","📆","🔔","📑","✏️","📔"]
  },
  {
    name: "Meals / Food",
    emojis: ["🍽️","🍕","🍟","🍔","🍏","🍩","🥞","🌮","🥗","🍿","🍦","🍭"]
  },
  {
    name: "Parties / Events",
    emojis: ["🎉","🎂","🎈","🎁","🎊","🥳","🎶","🎵","🔥","🔮","🍾","🎬"]
  },
  {
    name: "Music & Art",
    emojis: ["🎨","🎼","🎧","🎹","🎷","🎸","🥁","🖌️","🎭","🪗"]
  },
  {
    name: "Other Kids Activities",
    emojis: ["🛝","🏰","🎡","🎢","🎠","🛹","🪁","🪀","🏓","🃏"]
  }
];

let dragItem = null;
let dragItemOriginalParent = null;
let homeworkToggled = false; // track state
let confettiActive = false; // if confetti is playing

////////////////////////////////////////////
// Initialization
////////////////////////////////////////////
window.addEventListener('load', () => {
  initCarousel();
  initCategories();
  attachButtons();
  setActiveDay('midday'); // center by default
});

function initCarousel() {
  document.getElementById('morningSect').addEventListener('click', () => setActiveDay('morning'));
  document.getElementById('middaySect').addEventListener('click', () => setActiveDay('midday'));
  document.getElementById('eveningSect').addEventListener('click', () => setActiveDay('evening'));

  // Double-tap to remove logic in placeholders
  const placeholders = document.querySelectorAll('.placeholder');
  placeholders.forEach(ph => {
    // We'll attach an event on the child emoji itself
    ph.addEventListener('click', e => {
      // Single clicks do nothing here
    });
  });
}

function setActiveDay(day) {
  const morningSect = document.getElementById('morningSect');
  const middaySect  = document.getElementById('middaySect');
  const eveningSect = document.getElementById('eveningSect');

  morningSect.classList.remove('active','center','left','right');
  middaySect.classList.remove('active','center','left','right');
  eveningSect.classList.remove('active','center','left','right');

  if(day === 'morning') {
    morningSect.classList.add('active');
    middaySect.classList.add('right');
    eveningSect.classList.add('left');
  } else if(day === 'midday') {
    middaySect.classList.add('active','center');
    eveningSect.classList.add('right');
    morningSect.classList.add('left');
  } else {
    eveningSect.classList.add('active');
    morningSect.classList.add('right');
    middaySect.classList.add('left');
  }
}

////////////////////////////////////////////
// Categories & Emojis
////////////////////////////////////////////
function initCategories() {
  const mainContent = document.getElementById('mainContent');

  categories.forEach(cat => {
    // Category label
    const catTitle = document.createElement('h2');
    catTitle.textContent = cat.name;
    mainContent.appendChild(catTitle);

    // Emoji grid
    const grid = document.createElement('div');
    grid.className = 'emoji-grid';
    cat.emojis.forEach(emo => {
      const eDiv = document.createElement('div');
      eDiv.className = 'emoji-item';
      eDiv.textContent = emo;
      // Touch & double tap
      eDiv.addEventListener('touchstart', handleEmojiTouchStart);
      eDiv.addEventListener('touchmove', handleEmojiTouchMove, {passive:false});
      eDiv.addEventListener('touchend', handleEmojiTouchEnd);

      // Double-tap to delete if in a placeholder
      eDiv.addEventListener('dblclick', handleDoubleTap);

      grid.appendChild(eDiv);
    });
    mainContent.appendChild(grid);
  });
}

function handleDoubleTap(e) {
  // If the emoji is inside a placeholder, remove it
  const parentPH = e.currentTarget.parentElement;
  if(parentPH && parentPH.classList.contains('placeholder')) {
    parentPH.removeChild(e.currentTarget);
  }
}

////////////////////////////////////////////
// Drag & Drop
////////////////////////////////////////////
function handleEmojiTouchStart(e) {
  if(e.touches.length > 1) return; // ignore multi-touch
  const t = e.touches[0];
  dragItem = e.currentTarget;
  dragItemOriginalParent = dragItem.parentElement;
  dragItem.classList.add('dragging');

  // iOS continuous haptics (simulate by vibrate in intervals):
  if(navigator.vibrate) {
    // Start a short interval vibrate
    dragItem.hapticInterval = setInterval(() => {
      navigator.vibrate(10);
    }, 150);
  }

  positionDragItem(t.pageX, t.pageY);
}

function handleEmojiTouchMove(e) {
  if(!dragItem) return;
  e.preventDefault();
  const t = e.touches[0];
  positionDragItem(t.pageX, t.pageY);
}

function handleEmojiTouchEnd(e) {
  if(!dragItem) return;

  // Stop the continuous haptic
  if(dragItem.hapticInterval) {
    clearInterval(dragItem.hapticInterval);
    dragItem.hapticInterval = null;
  }

  // On drop => fast vibration + zoom effect
  if(navigator.vibrate) {
    navigator.vibrate([10,10,10,10,10]); // fast pulses
  }
  dragItem.classList.add('drop-zoom'); // add zoom animation
  setTimeout(() => {
    dragItem.classList.remove('drop-zoom');
  }, 300);

  const changedTouch = e.changedTouches[0];
  const dropTarget = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY);

  if(dropTarget && dropTarget.classList.contains('placeholder')) {
    if(dropTarget.children.length === 0) {
      dropTarget.appendChild(dragItem);
    } else {
      // swap if placeholder is occupied
      const occupant = dropTarget.children[0];
      if(dragItemOriginalParent && dragItemOriginalParent.classList.contains('placeholder')) {
        dragItemOriginalParent.appendChild(occupant);
        dropTarget.appendChild(dragItem);
      } else {
        dropTarget.appendChild(dragItem);
      }
    }
  } else {
    magnetReturn(dragItem, dragItemOriginalParent);
  }

  dragItem.classList.remove('dragging');
  dragItem = null;
  dragItemOriginalParent = null;
}

function positionDragItem(x, y) {
  dragItem.style.left = x + 'px';
  dragItem.style.top  = y + 'px';
}

function magnetReturn(item, originalParent) {
  if(originalParent) {
    originalParent.appendChild(item);
  }
}

/* Zoom animation for dropped emoji */
const style = document.createElement('style');
style.innerHTML = `
.drop-zoom {
  animation: dropZoom 0.3s ease;
}
@keyframes dropZoom {
  0% { transform: scale(1.0); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1.0); }
}
`;
document.head.appendChild(style);

////////////////////////////////////////////
// Buttons
////////////////////////////////////////////
function attachButtons() {
  const btnReset = document.getElementById('btnReset');
  const btnSave = document.getElementById('btnSave');
  const btnHomework = document.getElementById('btnHomework');

  if(btnReset) btnReset.addEventListener('click', resetLayout);
  if(btnSave) btnSave.addEventListener('click', saveLayout);
  if(btnHomework) btnHomework.addEventListener('click', toggleHomework);
}

function resetLayout() {
  // Show overlay
  const overlay = document.getElementById('resetOverlay');
  overlay.classList.remove('hidden');
  setTimeout(() => {
    layout.morning = [null,null,null,null];
    layout.midday  = [null,null,null,null];
    layout.evening = [null,null,null,null];

    const placeholders = document.querySelectorAll('.placeholder');
    placeholders.forEach(ph => {
      while(ph.firstChild) {
        document.getElementById('mainContent').appendChild(ph.firstChild);
      }
    });
    // Hide overlay
    overlay.classList.add('hidden');
    alert("Layout reset complete!");
  }, 1200);
}

function saveLayout() {
  alert("Save not implemented. (Add your logic to store the layout!)");
}

/* Homework toggle => confetti once => text changes -> Good Job! 🎉 */
function toggleHomework() {
  const btnHW = document.getElementById('btnHomework');
  if(!homeworkToggled) {
    // Turn on => green + text
    homeworkToggled = true;
    btnHW.style.background = "linear-gradient(135deg, #00aa00, #00ff00)";
    btnHW.textContent = "Good Job! 🎉";
    // Confetti once
    launchConfetti();
  } else {
    // Turn off => back to red
    homeworkToggled = false;
    btnHW.style.background = "linear-gradient(135deg, #ff4444, #ff8888)";
    btnHW.textContent = "Homework ❗";
  }
}

////////////////////////////////////////////
// Confetti (basic approach)
////////////////////////////////////////////
function launchConfetti() {
  const container = document.getElementById('confettiContainer');
  container.classList.remove('hidden');
  
  // create multiple confetti pieces
  for(let i=0; i<40; i++){
    let piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + "%";
    container.appendChild(piece);

    // random delay for each piece
    let delay = Math.random() * 1;
    piece.style.animationDelay = delay + "s";
    
    // random color
    let colors = ["#ff0", "#0f0", "#00f", "#f0f", "#ff8c00", "#f00"];
    piece.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
  }

  // remove them after ~3s
  setTimeout(() => {
    while(container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.classList.add('hidden');
  }, 3000);
}

// Confetti piece style
const confettiStyle = document.createElement('style');
confettiStyle.innerHTML = `
.confetti-piece {
  position: absolute;
  top: 0; 
  width: 8px; 
  height: 8px;
  opacity: 0.9;
  animation: confettiFall 3s linear forwards;
}
@keyframes confettiFall {
  0% { transform: translateY(0) rotateZ(0); }
  100% { transform: translateY(100vh) rotateZ(360deg); }
}
`;
document.head.appendChild(confettiStyle);
