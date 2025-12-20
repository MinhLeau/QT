        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
        import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

        const firebaseConfig = {
            apiKey: "AIzaSyDvB54m2uxhjuE2moJQ09NcuAEVhro7Zh4",
            authDomain: "quoctichuc-43f28.firebaseapp.com",
            projectId: "quoctichuc-43f28",
            storageBucket: "quoctichuc-43f28.firebasestorage.app",
            messagingSenderId: "710420527110",
            appId: "1:710420527110:web:ba4281739f963e76656b87"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);

        onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.location.href = 'login.html';
            } else {
                console.log('Logged in as:', user.email);
            }
        });

        window.logout = async function () {
            try {
                await signOut(auth);
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout error:', error);
            }
        };
