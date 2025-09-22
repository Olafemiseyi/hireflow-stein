document.getElementById('toggleFiltersBtn').addEventListener('click', function() {
    var filtersCollapse = document.getElementById('filtersCollapse');
    var bsCollapse = new bootstrap.Collapse(filtersCollapse, {
        toggle: false
    });
    // Toggle the collapse state
    if (filtersCollapse.classList.contains('show')) {
        bsCollapse.hide();
    } else {
        bsCollapse.show();
    }
});