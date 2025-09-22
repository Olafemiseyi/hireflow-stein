document.addEventListener('DOMContentLoaded', () => {
    // Logic for the Top Navbar
    const topNavbar = document.querySelector('.navbar');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            topNavbar.classList.add('scrolled');
        } else {
            topNavbar.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);

    // Logic for both navigation bars
    const allNavItems = document.querySelectorAll('.navigation ul li, .navbar-nav .nav-item');

    // This function sets the active state on page load based on the URL
    function updateActiveLink() {
        const currentUrl = window.location.href;

        // First, remove the active class from all items to prevent conflicts
        allNavItems.forEach(item => {
            item.classList.remove('active');
        });

        // Then, find and add the active class to the correct item
        allNavItems.forEach(item => {
            const link = item.querySelector('a');
            const linkHref = link.getAttribute('href');
            
            // Handle cases where the link is the homepage root (e.g., "/")
            const isHomePage = linkHref === '/' || linkHref === '/index.html';
            const isCurrentHomePage = currentUrl.endsWith('/index.html') || currentUrl.endsWith('/');

            // Check if the current URL contains the link's href, with a special case for the home page
            if ((!isHomePage && currentUrl.includes(linkHref)) || (isHomePage && isCurrentHomePage)) {
                item.classList.add('active');
            }
        });
    }

    // Call the function on initial page load
    updateActiveLink();
});