function openWaitlistPopup() {
    const popup = document.getElementById('waitlistPopup');
    popup.classList.remove('hidden');
    popup.classList.add('flex');
    document.getElementById('waitlistEmail').focus();
}

function closeWaitlistPopup() {
    const popup = document.getElementById('waitlistPopup');
    popup.classList.remove('flex');
    popup.classList.add('hidden');
}

async function submitWaitlist(event) {
    event.preventDefault();
    const email = document.getElementById('waitlistEmail').value;

    try {
        const response = await fetch('https://jsspy.onrender.com/api/waitlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            showToast('Thank you for joining the waitlist! We\'ll notify you when we launch. 😊', 'success');
            closeWaitlistPopup();
            document.getElementById('waitlistEmail').value = '';
        } else {
            const data = await response.json();
            showToast(data.error || 'Failed to join waitlist. Please try again.', 'error');
        }
    } catch (error) {
        showToast('Failed to join waitlist. Please try again.', 'error');
    }
}

// Close popup when clicking outside
document.addEventListener('click', (event) => {
    const popup = document.getElementById('waitlistPopup');
    if (popup.classList.contains('flex') && 
        !event.target.closest('.bg-gray-900') && 
        !event.target.matches('button')) {
        closeWaitlistPopup();
    }
});

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.error('Toast container not found');
        return;
    }

    // Check if we already have 5 toasts
    if (container.children.length >= 5) {
        // Remove the oldest toast (first child)
        const oldToast = container.firstChild;
        oldToast.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => {
            if (container.contains(oldToast)) {
                container.removeChild(oldToast);
            }
        }, 500);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `bg-gray-800 text-white px-6 py-4 rounded-lg shadow-lg mb-2 min-w-[200px] max-w-[400px] opacity-0 translate-x-full transition-all duration-500 ${type === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`;
    toast.textContent = message;

    // Add to container
    container.appendChild(toast);

    // Trigger reflow to ensure transition works
    toast.offsetHeight;

    // Show the toast
    requestAnimationFrame(() => {
        toast.classList.remove('opacity-0', 'translate-x-full');
    });

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 500);
    }, 3000);
} 
