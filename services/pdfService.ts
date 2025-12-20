
import { jsPDF } from 'jspdf';
import { Quiz } from '../types';

export const downloadQuizAsPdf = (quiz: Quiz) => {
    const doc = new jsPDF();

    // Helper function for text wrapping
    const addWrappedText = (text: string, x: number, y: number, options: { maxWidth: number, lineHeight: number }) => {
        const lines = doc.splitTextToSize(text, options.maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * options.lineHeight);
    };

    let yPosition = 20;
    const leftMargin = 15;
    const maxWidth = 180;

    // --- Quiz Questions Page ---
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    yPosition = addWrappedText(quiz.title, leftMargin, yPosition, { maxWidth, lineHeight: 7 });
    
    yPosition += 10;

    quiz.questions.forEach((q, index) => {
        if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const questionText = `${index + 1}. ${q.questionText}`;
        yPosition = addWrappedText(questionText, leftMargin, yPosition, { maxWidth, lineHeight: 6 });
        
        yPosition += 2;

        doc.setFont('helvetica', 'normal');
        q.options.forEach((opt, optIndex) => {
            const optionLabel = String.fromCharCode(65 + optIndex);
            const optionText = `${optionLabel}) ${opt}`;
            yPosition = addWrappedText(optionText, leftMargin + 5, yPosition + 6, { maxWidth: maxWidth - 5, lineHeight: 6 });
        });

        yPosition += 10;
    });

    // --- Answer Key Page ---
    doc.addPage();
    yPosition = 20;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Answer Key', leftMargin, yPosition);

    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    quiz.questions.forEach((q, index) => {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
             doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Answer Key (Continued)', leftMargin, yPosition);
            yPosition += 15;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
        }
        const correctAnswerLabel = String.fromCharCode(65 + q.correctAnswerIndex);
        doc.text(`${index + 1}: ${correctAnswerLabel}`, leftMargin, yPosition);
        yPosition += 7;
    });

    doc.save(`${quiz.title.replace(/\s/g, '_')}.pdf`);
};
