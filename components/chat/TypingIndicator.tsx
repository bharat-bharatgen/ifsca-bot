import { useState, useEffect } from 'react';

const thinkingSteps = [
  { text: 'Searching IFSCA documents', icon: '🔍' },
  { text: 'Analyzing regulations', icon: '📋' },
  { text: 'Cross-referencing guidelines', icon: '🔗' },
  { text: 'Formulating response', icon: '💭' },
];

export function TypingIndicator() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % thinkingSteps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const step = thinkingSteps[currentStep];

  return (
    <div className="flex justify-start">
      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 min-w-[200px]">
        <div className="flex items-center space-x-3">
          <span className="text-lg animate-pulse">{step.icon}</span>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 font-medium">
              {step.text}
              <span className="inline-flex ml-1">
                <span className="animate-[bounce_1s_infinite_0ms] text-gray-400">.</span>
                <span className="animate-[bounce_1s_infinite_200ms] text-gray-400">.</span>
                <span className="animate-[bounce_1s_infinite_400ms] text-gray-400">.</span>
              </span>
            </span>
            <div className="flex space-x-1 mt-1">
              {thinkingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 w-6 rounded-full transition-colors duration-300 ${
                    index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
