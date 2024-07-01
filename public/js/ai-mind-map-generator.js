// Select DOM elements
const topicInput = document.getElementById('topic-input');
const generateBtn = document.getElementById('generate-button');
const mindMapLink = document.getElementById('mind-map-link');
const markdownContent = document.getElementById('markdown-content');

// Add event listener to the generate button
generateBtn.addEventListener('click', generateMindMap);

async function generateMindMap() {
    const topic = topicInput.value.trim();
    
    if (!topic) {
        alert('Please enter a topic');
        return;
    }

    try {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';

        const response = await fetch('/.netlify/functions/generate-mindmap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Display the markdown content
        markdownContent.textContent = data.markdown;

        // Generate and display the mind map
        const htmlContent = generateMindMapHtml(topic, data.markdown);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.textContent = 'View Your Mind Map';
        link.target = '_blank';

        mindMapLink.innerHTML = '';
        mindMapLink.appendChild(link);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while generating the mind map.');
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Mind Map';
    }
}

function generateMindMapHtml(topic, markdown) {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Mind Map: ${topic}</title>
    <style>
        svg.markmap {
            width: 100%;
            height: 100vh;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/markmap-autoloader@0.16"></script>
</head>
<body>
    <div class="markmap">
        <script type="text/template">
        ${markdown}
        </script>
    </div>
</body>
</html>`;
}