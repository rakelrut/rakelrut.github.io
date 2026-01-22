/**
 * PHP Email Form Validation - Adapted for Formspree (GitHub Pages)
 */
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      let thisForm = this;

      // Show loading, hide messages
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData(thisForm);

      // Optional: reCAPTCHA support
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');
      if (recaptcha) {
        if (typeof grecaptcha !== "undefined") {
          grecaptcha.ready(function () {
            grecaptcha.execute(recaptcha, { action: 'php_email_form_submit' })
              .then(token => {
                formData.set('g-recaptcha-response', token);
                submitForm(thisForm, formData);
              });
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!');
        }
      } else {
        submitForm(thisForm, formData);
      }
    });
  });

  function submitForm(thisForm, formData) {
    // Use the action attribute (Formspree endpoint)
    let action = thisForm.getAttribute('action');
    if (!action) {
      displayError(thisForm, 'The form action property is not set!');
      return;
    }

    fetch(action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' } // Formspree expects JSON
    })
      .then(response => response.json())
      .then(data => {
        thisForm.querySelector('.loading').classList.remove('d-block');
        if (data.ok || data.success) {
          thisForm.querySelector('.sent-message').classList.add('d-block');
          thisForm.reset();
        } else {
          let errorMessage = data.errors ? data.errors.map(e => e.message).join(", ") : "Form submission failed!";
          displayError(thisForm, errorMessage);
        }
      })
      .catch((error) => {
        displayError(thisForm, error);
      });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
