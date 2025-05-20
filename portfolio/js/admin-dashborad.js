import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyDetpFm7TbKddqNjpN6dojuiY7bHh1ErOI",
  authDomain: "portfolio-3f340.firebaseapp.com",
  projectId: "portfolio-3f340",
  storageBucket: "portfolio-3f340.appspot.com",
  messagingSenderId: "698736281780",
  appId: "1:698736281780:web:09b0937708430b160e2fe1"
};

initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = 'admin.html';
  } else {
    loadHero();
    loadAbout();
    loadContact();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      signOut(auth).then(() => {
        window.location.href = 'index.html';
      }).catch(error => {
        console.error("Logout error:", error);
        alert("Logout failed: " + error.message);
      });
    });
  } else {
    console.error("Logout button not found");
  }
});

// HERO SECTION
async function loadHero() {
  const snap = await getDoc(doc(db, "content", "hero"));
  if (snap.exists()) {
    const d = snap.data();
    document.getElementById('hero-name').value = d.name || '';
    document.getElementById('hero-profession').value = d.profession || '';
    document.getElementById('hero-description').value = d.description || '';
    document.getElementById('hero-typing-words').value = 
      d.typingWords ? d.typingWords.join(", ") : '';
  }
}

document.getElementById('hero-form').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('hero-name').value;
  const profession = document.getElementById('hero-profession').value;
  const description = document.getElementById('hero-description').value;
  const typingWords = document.getElementById('hero-typing-words').value
    .split(',')
    .map(word => word.trim())
    .filter(word => word.length > 0);
  const file = document.getElementById('hero-image').files[0];

  let imageUrl = null;
  if (file) {
    const fileRef = ref(storage, `hero/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);
    uploadTask.on('state_changed', snapshot => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      document.getElementById('hero-progress').value = progress;
    });
    await new Promise(resolve => uploadTask.on('state_changed', null, null, resolve));
    imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
  }

  const heroData = {
    name,
    profession,
    description,
    typingWords,
    updatedAt: serverTimestamp()
  };

  if (imageUrl) {
    heroData.imageUrl = imageUrl;
  }

  await setDoc(doc(db, "content", "hero"), heroData);
  alert("✅ Hero section saved.");
});

// ABOUT SECTION
async function loadAbout() {
  const snap = await getDoc(doc(db, "content", "about"));
  if (snap.exists()) {
    const d = snap.data();
    document.getElementById('about-bio').value = d.bio || '';
    document.getElementById('about-name').value = d.name || '';
    document.getElementById('about-email').value = d.email || '';
    document.getElementById('about-experience').value = d.experience || '';
    document.getElementById('about-location').value = d.location || '';
  }
}

document.getElementById('about-form').addEventListener('submit', async e => {
  e.preventDefault();
  const bio = document.getElementById('about-bio').value;
  const name = document.getElementById('about-name').value;
  const email = document.getElementById('about-email').value;
  const experience = document.getElementById('about-experience').value;
  const location = document.getElementById('about-location').value;

  await setDoc(doc(db, "content", "about"), { 
    bio, 
    name, 
    email, 
    experience, 
    location, 
    updatedAt: serverTimestamp() 
  });
  alert("✅ About section saved.");
});

// CONTACT SECTION
async function loadContact() {
  const snap = await getDoc(doc(db, "content", "contact"));
  if (snap.exists()) {
    const d = snap.data();
    document.getElementById('contact-email').value = d.email || '';
    document.getElementById('contact-phone').value = d.phone || '';
    document.getElementById('contact-location').value = d.location || '';
  }
}

document.getElementById('contact-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('contact-email').value;
  const phone = document.getElementById('contact-phone').value;
  const location = document.getElementById('contact-location').value;

  await setDoc(doc(db, "content", "contact"), { 
    email, 
    phone, 
    location, 
    updatedAt: serverTimestamp() 
  });
  alert("✅ Contact info saved.");
});

// PROJECTS SECTION
document.getElementById('project-form').addEventListener('submit', async e => {
  e.preventDefault();
  const title = document.getElementById('project-title').value;
  const description = document.getElementById('project-description').value;
  const tags = document.getElementById('project-tags').value.split(',').map(t => t.trim());
  const liveUrl = document.getElementById('project-live-url').value;
  const codeUrl = document.getElementById('project-code-url').value;
  const file = document.getElementById('project-image').files[0];

  let imageUrl = '';
  if (file) {
    const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    await new Promise(resolve => uploadTask.on('state_changed', null, null, resolve));
    imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
  }

  await addDoc(collection(db, 'projects'), {
    title,
    description,
    tags,
    liveUrl,
    codeUrl,
    imageUrl,
    createdAt: serverTimestamp()
  });

  alert("✅ Project added successfully.");
  e.target.reset();
});

// SKILLS SECTION
document.getElementById('skills-form').addEventListener('submit', async e => {
  e.preventDefault();
  const category = document.getElementById('skill-category').value;
  const name = document.getElementById('skill-name').value;
  const level = parseInt(document.getElementById('skill-level').value);

  if (!name || isNaN(level) || level < 0 || level > 100) {
    alert("❌ Please enter valid skill name and level (0-100).");
    return;
  }

  await addDoc(collection(db, 'skills'), {
    category,
    name,
    level,
    createdAt: serverTimestamp()
  });

  alert("✅ Skill added successfully.");
  e.target.reset();
});