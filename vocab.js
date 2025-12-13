let voices = [];
let originalOrder = [];
let isSorted = false;

const voiceSelect = document.getElementById('voiceSelect');
const notice = document.getElementById('notice');
const tbody = document.querySelector('#vocabTable tbody');
const filterButtons = document.querySelectorAll('.filter-btn');
const resetBtn = document.getElementById('resetBtn');

const STORAGE_PREFIX = 'CITIZENSHIP_VOCAB_' + location.pathname.replace(/[^a-zA-Z0-9]/g, '_');

// Lưu trạng thái
function saveAll() {
    const checked = Array.from(tbody.querySelectorAll('.row-check:checked'))
        .map(cb => cb.closest('tr').cells[0].textContent.trim());
    localStorage.setItem(STORAGE_PREFIX + '_checked', JSON.stringify(checked));
    localStorage.setItem(STORAGE_PREFIX + '_filter', document.querySelector('.filter-btn.active').dataset.mode);
    localStorage.setItem(STORAGE_PREFIX + '_voice', voiceSelect.value);
}

// Khôi phục trạng thái
function loadAll() {
    const savedChecked = localStorage.getItem(STORAGE_PREFIX + '_checked');
    if (savedChecked) {
        const checkedNos = JSON.parse(savedChecked);
        tbody.querySelectorAll('.row-check').forEach(cb => {
            const no = cb.closest('tr').cells[0].textContent.trim();
            cb.checked = checkedNos.includes(no);
        });
    }

    const savedFilter = localStorage.getItem(STORAGE_PREFIX + '_filter') || 'all';
    setActiveFilter(savedFilter);
    filterRows(savedFilter);

    const savedVoice = localStorage.getItem(STORAGE_PREFIX + '_voice');
    if (savedVoice) voiceSelect.dataset.saved = savedVoice;
}

// Đổi nút active + lọc
function setActiveFilter(mode) {
    filterButtons.forEach(btn => {
        if (btn.id !== 'resetBtn') {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        }
    });
}

filterButtons.forEach(btn => {
    if (btn.id !== 'resetBtn') {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            setActiveFilter(mode);
            filterRows(mode);
            renumberVisible();
            saveAll();
        });
    }
});

// Xử lý nút Reset
resetBtn.addEventListener('click', () => {
    // Bỏ chọn tất cả checkbox
    tbody.querySelectorAll('.row-check').forEach(cb => {
        cb.checked = false;
    });
    
    // Chuyển về chế độ Show All
    setActiveFilter('all');
    filterRows('all');
    renumberVisible();
    saveAll();
});

tbody.addEventListener('change', (e) => {
    if (e.target.classList.contains('row-check')) {
        renumberVisible();
        saveAll();
    }
});

voiceSelect.addEventListener('change', saveAll);

document.addEventListener('DOMContentLoaded', () => {
    originalOrder = Array.from(tbody.rows);
    loadVoices();
    loadAll();
    renumberVisible();

    // Thêm active cho nút nav-bar tương ứng với trang hiện tại
    const navLinks = document.querySelectorAll('.nav-bar .btn');
    navLinks.forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add('active');
        }
    });
});


function loadVoices() {
    voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
        speechSynthesis.onvoiceschanged = loadVoices;
        return;
    }
    let ausVoices = voices.filter(v => v.lang === 'en-AU' || v.name.toLowerCase().includes('australian'));
    let otherVoices = voices.filter(v => v.lang.startsWith('en-') && !ausVoices.includes(v));
    voices = [...ausVoices, ...otherVoices];

    voiceSelect.innerHTML = '';
    if (ausVoices.length === 0) notice.style.display = 'block';

    voices.forEach((voice, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        const gender = (voice.name.toLowerCase().includes('female') || ['karen','catherine','lee'].some(n=>voice.name.toLowerCase().includes(n))) ? '(Nữ)' : '(Nam)';
        opt.textContent = `${voice.name} (${voice.lang}) ${gender}`;
        voiceSelect.appendChild(opt);
    });

    const saved = voiceSelect.dataset.saved || localStorage.getItem(STORAGE_PREFIX + '_voice');
    if (saved !== null && voiceSelect.options[saved]) {
        voiceSelect.value = saved;
    } else {
        const ausIdx = voices.findIndex(v => v.lang === 'en-AU');
        voiceSelect.value = ausIdx !== -1 ? ausIdx : 0;
    }
}

function speak(text) {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const idx = voiceSelect.value;
    if (idx && voices[idx]) utterance.voice = voices[idx];
    else utterance.lang = 'en-AU';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
}

function filterRows(mode) {
    for (let row of tbody.rows) {
        const checked = row.querySelector('.row-check').checked;
        row.classList.toggle('hidden', 
            mode === 'checked' ? !checked : 
            mode === 'unchecked' ? checked : false
        );
    }
    renumberVisible();
}

function renumberVisible() {
    let count = 1;
    tbody.querySelectorAll('tr').forEach(row => {
        if (!row.classList.contains('hidden')) {
            row.cells[0].textContent = count++;
        }
    });
}

function sortTable() {
    const rows = Array.from(tbody.rows);
    if (!isSorted) {
        rows.sort((a, b) => a.cells[2].textContent.localeCompare(b.cells[2].textContent));
        isSorted = true;
    } else {
        rows.sort((a, b) => originalOrder.indexOf(a) - originalOrder.indexOf(b));
        isSorted = false;
    }
    rows.forEach(r => tbody.appendChild(r));
    renumberVisible();
}

document.querySelectorAll('[data-sentence]').forEach(btn => {
    btn.onclick = () => speak(btn.dataset.sentence);
});
