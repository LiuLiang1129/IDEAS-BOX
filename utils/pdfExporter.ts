import { Group, Post } from '../types';

// Let TypeScript know jsPDF is available globally from the script tag in index.html
declare const jspdf: any;

const addImageToPdf = (doc: any, imageDataUrl: string, x: number, y: number, maxWidth: number, maxHeight: number): Promise<number> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const imgProps = doc.getImageProperties(imageDataUrl);
            const aspectRatio = imgProps.width / imgProps.height;
            let imgWidth = maxWidth;
            let imgHeight = imgWidth / aspectRatio;

            if (imgHeight > maxHeight) {
                imgHeight = maxHeight;
                imgWidth = imgHeight * aspectRatio;
            }

            doc.addImage(imageDataUrl, 'JPEG', x, y, imgWidth, imgHeight);
            resolve(y + imgHeight + 5); // Return new y position
        };
        img.src = imageDataUrl;
        img.onerror = () => {
            console.error("Failed to load image for PDF export.");
            resolve(y); // Resolve with original Y if image fails
        }
    });
};

export const exportGroupViewAsPDF = async (group: Group, posts: Post[]) => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`Team Idea Board - ${group.name}`, pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exported on ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    if (!posts || posts.length === 0) {
        doc.setFontSize(14);
        doc.text('No ideas have been posted in this group yet.', margin, y);
        doc.save(`ideaboard-${group.name.replace(/\s/g, '_')}.pdf`);
        return;
    }
    
    for (const post of posts) {
        const estimatedHeight = 50 + (post.imageUrl ? 60 : 0) + (post.comments.length * 8);
        if (y + estimatedHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = 20;
        }

        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text(`By ${post.author} | Votes: ${post.votes.length}`, margin, y);
        y += 7;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        const contentLines = doc.splitTextToSize(post.content, pageWidth - margin * 2);
        doc.text(contentLines, margin, y);
        y += (contentLines.length * 5) + 5;
        
        if (post.imageUrl) {
            y = await addImageToPdf(doc, post.imageUrl, margin, y, 80, 50);
        }
        
        if (post.comments.length > 0) {
            y += 5;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Comments:', margin, y);
            y += 6;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            for (const comment of post.comments) {
                 if (y > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    y = 20;
                }
                const commentText = `${comment.author}: ${comment.text}`;
                const commentLines = doc.splitTextToSize(commentText, pageWidth - margin * 2 - 5);
                doc.text(commentLines, margin + 5, y);
                y += (commentLines.length * 4) + 2;
            }
        }
        y += 5;
    }

    doc.save(`ideaboard-${group.name.replace(/\s/g, '_')}.pdf`);
};

export const exportResultsViewAsPDF = async (groups: Group[], topPosts: (Post | null)[]) => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Best Ideas Summary', pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exported on ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const post = topPosts[i];

        if (y > doc.internal.pageSize.getHeight() - 60) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(group.name, margin, y);
        y += 10;
        
        if (post) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text(`By ${post.author} | Votes: ${post.votes.length}`, margin, y);
            y += 7;

            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            const textWidth = pageWidth - margin * 2 - (post.imageUrl ? 70 : 0);
            const contentLines = doc.splitTextToSize(post.content, textWidth);
            let textBlockHeight = contentLines.length * 5;
            
            if (post.imageUrl) {
                const imageY = y - 7;
                doc.text(contentLines, margin, y);
                const newY = await addImageToPdf(doc, post.imageUrl, pageWidth - margin - 60, imageY, 60, 40);
                const imageBlockHeight = newY - imageY;
                y += Math.max(textBlockHeight, imageBlockHeight) + 10;
            } else {
                doc.text(contentLines, margin, y);
                y += textBlockHeight + 10;
            }

        } else {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text('This group has no ideas yet.', margin, y);
            y += 15;
        }
    }

    doc.save('ideaboard-results.pdf');
};
