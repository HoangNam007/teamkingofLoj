
function setupDropdownKhuVuc() {
    const locationBtn = document.getElementById('locationBtn');
    const regionDropdown = document.getElementById('regionDropdown');
    if (!locationBtn || !regionDropdown) return;
    if (locationBtn.dataset.bound === 'true') return;
    locationBtn.dataset.bound = 'true';

    locationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        regionDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        regionDropdown.classList.remove('show');
    });}

function setupDropdownDanhMuc() {
    const categoryBtn = document.getElementById('categoryBtn');
    const categoryDropdown = document.getElementById('categoryDropdown');
    if (!categoryBtn || !categoryDropdown) return;
    if (categoryBtn.dataset.bound === 'true') return;
    categoryBtn.dataset.bound = 'true';

    categoryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        categoryDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        categoryDropdown.classList.remove('show');
    });}

function showToast(message, type) {
    let toast = document.getElementById('toast');

    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        toast.id = 'toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = 'toast show';
    if (type) toast.classList.add(type);

    clearTimeout(toast._timeoutId);
    toast._timeoutId = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}
