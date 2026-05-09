document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[aria-controls]').forEach((button) => {
        const menuId = button.getAttribute('aria-controls');
        const menu = menuId ? document.getElementById(menuId) : null;

        if (!menu) {
            return;
        }

        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!isExpanded));
            menu.classList.toggle('hidden');

            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    });

    document.querySelectorAll('[data-current-year]').forEach((node) => {
        node.textContent = String(new Date().getFullYear());
    });
});
