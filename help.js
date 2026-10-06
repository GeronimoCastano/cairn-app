(() => {
 const query = document.querySelector('#faq-query');
 if (query) {
  document.querySelector('.faq-search').hidden = false;
  const answers = [...document.querySelectorAll('.answer')];
  const groups = [...document.querySelectorAll('.answer-group')];
  query.addEventListener('input', () => {
   const words = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
   let count = 0;
   answers.forEach(answer => {
    const matches = words.every(word => answer.textContent.toLowerCase().includes(word));
    answer.hidden = !matches;
    if (matches) count++;
   });
   groups.forEach(group => { group.hidden = !group.querySelector('.answer:not([hidden])'); });
   document.querySelector('#faq-empty').hidden = count > 0;
   document.querySelector('#faq-status').textContent = words.length ? `${count} matching answer${count === 1 ? '' : 's'}` : '';
  });
 }
})();
