
import React, { useMemo } from 'react';

interface PlanDisplayProps {
  planText: string;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ planText }) => {

  const parsedContent = useMemo(() => {
    const lines = planText.split('\n');
    // FIX: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
    const elements: React.ReactElement[] = [];
    let listItems: string[] = [];
    let keyCounter = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        const ulKey = `ul-${keyCounter++}`;
        elements.push(
          <ul key={ulKey} className="list-disc list-inside space-y-2 mb-4">
            {listItems.map((item, index) => {
               const boldedItem = item.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-100">$1</strong>');
               return <li key={`${ulKey}-li-${index}`} dangerouslySetInnerHTML={{ __html: boldedItem.replace(/^\* |^- /, '') }} />;
            })}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line) => {
      line = line.trim();
      if (!line) return;

      if (line.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={`h2-${keyCounter++}`} className="text-2xl font-bold text-sky-400 mt-6 mb-3">{line.substring(3)}</h2>);
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        listItems.push(line);
      } else {
        flushList();
        const boldedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-100">$1</strong>');
        elements.push(<p key={`p-${keyCounter++}`} className="mb-4" dangerouslySetInnerHTML={{ __html: boldedLine }} />);
      }
    });

    flushList(); // Make sure to flush any remaining list items
    return elements;
  }, [planText]);

  return <div className="p-6 md:p-8 text-slate-300 leading-relaxed">{parsedContent}</div>;
};

export default PlanDisplay;
