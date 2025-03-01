import React, { useState } from 'react';

interface Question {
  id: string;
  text: string;
  type: 'radio' | 'text' | 'select';
  options?: string[];
}

interface SurveyResponse {
  shopId: string;
  responses: {
    questionId: string;
    question: string;
    answer: string;
  }[];
}

interface SurveyFormProps {
  shopId: string;
  questions: Question[];
  onSubmit: (responses: SurveyResponse) => void;
}

export default function SurveyForm({ shopId, questions, onSubmit }: SurveyFormProps) {
  const [responses, setResponses] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedResponses = Object.entries(responses).map(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId);
      return {
        questionId,
        question: question?.text || '',
        answer,
      };
    });

    onSubmit({
      shopId,
      responses: formattedResponses,
    });
  };

  const handleChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Quick Survey</h2>
      
      {questions.map((question) => (
        <div key={question.id} className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            {question.text}
          </label>

          {question.type === 'radio' && question.options && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <div key={option} className="flex items-center">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    onChange={(e) => handleChange(question.id, e.target.value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label className="ml-2 text-sm text-gray-600">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          )}

          {question.type === 'text' && (
            <input
              type="text"
              onChange={(e) => handleChange(question.id, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          )}

          {question.type === 'select' && question.options && (
            <select
              onChange={(e) => handleChange(question.id, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select an option</option>
              {question.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Submit Survey
      </button>
    </form>
  );
} 