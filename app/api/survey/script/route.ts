export async function GET() {
  const script = `
    function createSurveyForm() {
      const surveyHtml = \`
        <div id="quick-survey" style="margin-top: 20px; padding: 15px; border: 1px solid #e5e5e5; border-radius: 4px;">
          <h3 style="margin-bottom: 15px;">Quick Survey</h3>
          <div style="margin-bottom: 15px;">
            <p>How satisfied are you with your shopping experience?</p>
            <div>
              <input type="radio" name="satisfaction" value="Very Satisfied" id="very-satisfied">
              <label for="very-satisfied">Very Satisfied</label>
            </div>
            <div>
              <input type="radio" name="satisfaction" value="Satisfied" id="satisfied">
              <label for="satisfied">Satisfied</label>
            </div>
            <div>
              <input type="radio" name="satisfaction" value="Neutral" id="neutral">
              <label for="neutral">Neutral</label>
            </div>
            <div>
              <input type="radio" name="satisfaction" value="Dissatisfied" id="dissatisfied">
              <label for="dissatisfied">Dissatisfied</label>
            </div>
            <div>
              <input type="radio" name="satisfaction" value="Very Dissatisfied" id="very-dissatisfied">
              <label for="very-dissatisfied">Very Dissatisfied</label>
            </div>
          </div>
          <div style="margin-bottom: 15px;">
            <p>Did you find everything you were looking for?</p>
            <div>
              <input type="radio" name="found_items" value="Yes" id="found-yes">
              <label for="found-yes">Yes</label>
            </div>
            <div>
              <input type="radio" name="found_items" value="No" id="found-no">
              <label for="found-no">No</label>
            </div>
          </div>
          <div style="margin-bottom: 15px;">
            <p>What could we improve?</p>
            <textarea id="improvements" style="width: 100%; padding: 8px; margin-top: 5px;"></textarea>
          </div>
          <button onclick="submitSurvey()" style="background-color: #008060; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
            Submit Survey
          </button>
        </div>
      \`;

      return surveyHtml;
    }

    async function submitSurvey() {
      const satisfaction = document.querySelector('input[name="satisfaction"]:checked')?.value;
      const foundItems = document.querySelector('input[name="found_items"]:checked')?.value;
      const improvements = document.getElementById('improvements')?.value;

      if (!satisfaction || !foundItems) {
        alert('Please answer all required questions');
        return;
      }

      const surveyData = {
        satisfaction,
        foundItems,
        improvements,
        shop: Shopify.shop
      };

      console.log('Submitting survey data:', surveyData);
      console.log('Submitting to URL:', '${process.env.HOST}/api/survey/submit');

      try {
        const response = await fetch('${process.env.HOST}/api/survey/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(surveyData)
        });

        const responseData = await response.text();
        console.log('Response status:', response.status);
        console.log('Response data:', responseData);

        if (response.ok) {
          document.getElementById('quick-survey').innerHTML = '<p style="text-align: center; padding: 20px;">Thank you for your feedback!</p>';
        } else {
          throw new Error(\`Failed to submit survey: \${responseData}\`);
        }
      } catch (error) {
        console.error('Survey submission error details:', error);
        alert(\`Failed to submit survey: \${error.message}\`);
      }
    }

    function addSurveyToPage() {
      // For cart page
      const cartForm = document.querySelector('form[action="/cart"]');
      if (cartForm && !document.getElementById('quick-survey')) {
        cartForm.insertAdjacentHTML('afterend', createSurveyForm());
      }

      // For cart drawer/popup
      const cartDrawer = document.querySelector('cart-drawer, #cart-drawer, .cart-drawer, .drawer');
      if (cartDrawer && !cartDrawer.querySelector('#quick-survey')) {
        cartDrawer.insertAdjacentHTML('beforeend', createSurveyForm());
      }
    }

    // Initial check
    addSurveyToPage();

    // Watch for cart updates and drawer openings
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          addSurveyToPage();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  `;

  return new Response(script, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
} 