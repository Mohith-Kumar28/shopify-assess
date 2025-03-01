export const generateCartScript = (shopId: string) => `
const SURVEY_QUESTIONS = [
  {
    id: 'satisfaction',
    text: 'How satisfied are you with your shopping experience?',
    type: 'radio',
    options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']
  },
  {
    id: 'findEverything',
    text: 'Did you find everything you were looking for?',
    type: 'radio',
    options: ['Yes', 'No']
  },
  {
    id: 'improvement',
    text: 'What could we improve?',
    type: 'text'
  }
];

function createSurveyForm() {
  const form = document.createElement('div');
  form.id = 'shopify-survey-form';
  form.innerHTML = \`
    <div class="survey-container" style="
      margin: 20px 0;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
    ">
      <h3 style="margin-bottom: 15px; font-size: 18px; font-weight: bold;">Quick Survey</h3>
      <form id="customer-survey">
        \${SURVEY_QUESTIONS.map(question => \`
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">
              \${question.text}
            </label>
            \${
              question.type === 'radio' 
                ? \`<div style="display: flex; flex-direction: column; gap: 8px;">
                    \${question.options?.map(option => \`
                      <label style="display: flex; align-items: center; gap: 8px;">
                        <input type="radio" name="\${question.id}" value="\${option}">
                        <span>\${option}</span>
                      </label>
                    \`).join('')}
                  </div>\`
                : \`<input type="text" name="\${question.id}" style="
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                  ">\`
            }
          </div>
        \`).join('')}
        <button type="submit" style="
          width: 100%;
          padding: 10px;
          background: #008060;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        ">Submit Survey</button>
      </form>
    </div>
  \`;

  return form;
}

function injectSurveyForm() {
  const cartForm = document.querySelector('form[action="/cart"]');
  if (!cartForm) return;

  const surveyForm = createSurveyForm();
  cartForm.parentNode.insertBefore(surveyForm, cartForm.nextSibling);

  document.getElementById('customer-survey').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const responses = [];

    for (const question of SURVEY_QUESTIONS) {
      const answer = formData.get(question.id);
      if (answer) {
        responses.push({
          questionId: question.id,
          question: question.text,
          answer: answer.toString()
        });
      }
    }

    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopId: '${shopId}',
          responses
        }),
      });

      if (response.ok) {
        surveyForm.innerHTML = \`
          <div style="text-align: center; padding: 20px;">
            <h3 style="color: #008060; margin-bottom: 10px;">Thank You!</h3>
            <p>Your feedback helps us improve our service.</p>
          </div>
        \`;
      }
    } catch (error) {
      console.error('Failed to submit survey:', error);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectSurveyForm);
} else {
  injectSurveyForm();
}
`; 