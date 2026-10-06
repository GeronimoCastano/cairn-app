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
 const form = document.querySelector('#support-form');
 const endpoint = window.CairnSupport?.endpoint;
 if (!form || !/^https:\/\/formspree\.io\/f\/[a-z0-9]+$/i.test(endpoint || '')) return;
 form.action = endpoint;
 form.hidden = false;
 document.querySelector('#support-fallback').hidden = true;
 const button = form.querySelector('[type=submit]');
 const status = document.querySelector('#support-status');
 form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity() || button.disabled) return;
  button.disabled = true; button.textContent = 'Sending…';
  status.textContent = 'Sending your message…';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
   const response = await fetch(endpoint, {method:'POST',body:new FormData(form),headers:{Accept:'application/json'},signal:controller.signal});
   if (!response.ok) throw new Error('delivery');
   form.reset();
   status.textContent = 'Your message was sent. We’ll reply by email.';
  } catch {
   status.textContent = 'We couldn’t confirm delivery. Your message is still here. Check your connection and try again; if the connection dropped after sending, we may already have received it.';
  } finally {
   clearTimeout(timeout);button.disabled = false;button.textContent = 'Send message';
  }
 });
})();
