import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth-compat.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore-compat.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-storage-compat.js';

const firebaseConfig = {
  apiKey: "AIzaSyDetpFm7TbKddqNjpN6dojuiY7bHh1ErOI",
  authDomain: "portfolio-3f340.firebaseapp.com",
  projectId: "portfolio-3f340",
  storageBucket: "portfolio-3f340.appspot.com",
  messagingSenderId: "698736281780",
  appId: "1:698736281780:web:09b0937708430b160e2fe1",
  measurementId: "G-6P6HXCRMBP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

window.addEventListener('load', () => {
  const loginForm = document.getElementById('login-form');
  const loginMessage = document.getElementById('login-message');

  function showMessage(message, isError = false) {
    if (loginMessage) {
      loginMessage.textContent = message;
      loginMessage.className = isError ? "error" : "success";
      loginMessage.style.display = "block";
    } else {
      alert(message);
    }
  }

  // Login submit
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');
      if (!emailInput || !passwordInput) {
        showMessage("❌ Login form fields missing.", true);
        return;
      }
      const email = emailInput.value;
      const password = passwordInput.value;

      try {
        await signInWithEmailAndPassword(auth, email, password);
        showMessage("✅ Login successful");
        const adminLogin = document.getElementById('admin-login');
        const adminDashboard = document.getElementById('admin-dashboard');
        if (adminLogin && adminDashboard) {
          adminLogin.style.display = 'none';
          adminDashboard.style.display = 'block';
        }
        loadHeroData();
        loadAboutData();
        loadContactData();
      } catch (error) {
        showMessage("❌ Login failed: " + (error && error.message ? error.message : error), true);
        console.error(error);
      }
    });
  } else {
    console.error("Login form not found in the DOM.");
  }

  // Firebase auth listener
  onAuthStateChanged(auth, (user) => {
    const adminLogin = document.getElementById('admin-login');
    const adminDashboard = document.getElementById('admin-dashboard');
    if (user) {
      adminLogin.style.display = 'none';
      adminDashboard.style.display = 'block';
      loadHeroData();
      loadAboutData();
      loadContactData();
    } else {
      adminLogin.style.display = 'block';
      adminDashboard.style.display = 'none';
    }
  });

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      signOut(auth).then(() => window.location.reload());
    });
  }

  // Load & Save Hero Section
  async function loadHeroData() {
    const docSnap = await getDoc(doc(db, "content", "hero"));
    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById('hero-name').value = data.name || "";
      document.getElementById('hero-profession').value = data.profession || "";
      document.getElementById('hero-description').value = data.description || "";
    }
  }

  const heroForm = document.getElementById('hero-form');
  if (heroForm) {
    heroForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name = document.getElementById('hero-name').value;
      const profession = document.getElementById('hero-profession').value;
      const description = document.getElementById('hero-description').value;
      const file = document.getElementById('hero-image').files[0];

      if (file) {
        const storageRef = ref(storage, 'images/hero-profile.jpg');
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on('state_changed', snapshot => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          document.getElementById('hero-image-progress').value = progress;
        }, null, async () => {
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          await setDoc(doc(db, "content", "hero"), { name, profession, description, imageUrl, updatedAt: serverTimestamp() });
          alert("✅ Hero section saved.");
        });
      } else {
        await setDoc(doc(db, "content", "hero"), { name, profession, description, updatedAt: serverTimestamp() });
        alert("✅ Hero section saved.");
      }
    });
  }

  // Load & Save About Section
  async function loadAboutData() {
    const docSnap = await getDoc(doc(db, "content", "about"));
    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById('about-bio').value = data.bio || "";
      document.getElementById('about-name').value = data.name || "";
      document.getElementById('about-email').value = data.email || "";
      document.getElementById('about-experience').value = data.experience || "";
      document.getElementById('about-location').value = data.location || "";
    }
  }

  const aboutForm = document.getElementById('about-form');
  if (aboutForm) {
    aboutForm.addEventListener('submit', async e => {
      e.preventDefault();
      const bio = document.getElementById('about-bio').value;
      const name = document.getElementById('about-name').value;
      const email = document.getElementById('about-email').value;
      const experience = document.getElementById('about-experience').value;
      const location = document.getElementById('about-location').value;

      await setDoc(doc(db, "content", "about"), { bio, name, email, experience, location, updatedAt: serverTimestamp() });
      alert("✅ About section saved.");
    });
  }

  // Load & Save Contact Section
  async function loadContactData() {
    const docSnap = await getDoc(doc(db, "content", "contact"));
    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById('contact-email').value = data.email || "";
      document.getElementById('contact-phone').value = data.phone || "";
      document.getElementById('contact-location').value = data.location || "";
    }
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('contact-email').value;
      const phone = document.getElementById('contact-phone').value;
      const location = document.getElementById('contact-location').value;

      await setDoc(doc(db, "content", "contact"), { email, phone, location, updatedAt: serverTimestamp() });
      alert("✅ Contact info saved.");
    });
  }
});
