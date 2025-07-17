// ** IMPORTANT: Replace with your deployed Google Apps Script Web App URL **
        const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyQFpd6T-8wpQjbyGZD1d90SZnT2uj88AoLhI3kYWeAy03pULaS6jjboCJJThCusIYVpg/exec'; 

        // Function to load comments from Google Sheet
        async function loadComments() {
            try {
                const response = await fetch(WEB_APP_URL);
                const comments = await response.json();
                const guestbookEntriesDiv = $('#guestbook-entries');
                
                // Clear existing entries except the title
                guestbookEntriesDiv.find('.guestbook-entry').remove();

                if (comments.length > 0) {
                    // Sort comments by timestamp (newest first)
                    comments.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
                    
                    comments.forEach(comment => {
                        const entry = `
                            <div class="guestbook-entry">
                                <h4>${comment.Name} bilang:</h4>
                                <p>"${comment.Message}"</p>
                                <small>${formatDate(new Date(comment.Timestamp))}</small>
                            </div>
                        `;
                        guestbookEntriesDiv.append(entry);
                    });
                } else {
                    guestbookEntriesDiv.append('<p class="no-entries">Belum ada pesan. Jadi yang pertama meninggalkan jejak!</p>');
                }
            } catch (error) {
                console.error('Error loading comments:', error);
                $('#guestbook-entries').append('<p class="error-message">Gagal memuat pesan. Silakan coba lagi nanti.</p>');
            }
        }

        // Format date to readable format
        function formatDate(date) {
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return date.toLocaleDateString('id-ID', options);
        }

        // Script for Guestbook (Buku Tamu)
        $('#guestbook-form').on('submit', async function(e) {
            e.preventDefault();
            const name = $('#guest-name').val().trim();
            const message = $('#guest-message').val().trim();

            if (!name || !message) {
                showAlert('Nama dan pesan tidak boleh kosong!', 'error');
                return;
            }

            try {
                const response = await fetch(WEB_APP_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        name: name,
                        message: message
                    })
                });
                
                const result = await response.json();

                if (result.status === 'success') {
                    showAlert('Pesan berhasil terkirim! 💖', 'success');
                    $('#guest-name').val('');
                    $('#guest-message').val('');
                    loadComments(); // Reload comments after successful submission
                } else {
                    showAlert('Gagal mengirim pesan. Silakan coba lagi.', 'error');
                }
            } catch (error) {
                console.error('Error submitting comment:', error);
                showAlert('Terjadi kesalahan saat mengirim pesan.', 'error');
            }
        });

        // Show alert message
        function showAlert(message, type) {
            const alert = document.createElement('div');
            alert.className = `alert ${type}`;
            alert.textContent = message;
            document.body.appendChild(alert);
            
            setTimeout(() => {
                alert.classList.add('show');
            }, 10);
            
            setTimeout(() => {
                alert.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(alert);
                }, 500);
            }, 3000);
        }

        // Script for Falling Hearts Animation
        const canvas = document.getElementById('falling-hearts-canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        resizeCanvas();
        
        // Heart particles
        const hearts = [];
        const heartColors = ['#ff69b4', '#ff1493', '#ff8adc', '#ffb6c1'];
        
        // Heart class
        class Heart {
            constructor() {
                this.reset();
                this.y = Math.random() * -100;
            }
            
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * -100 - 50;
                this.size = Math.random() * 20 + 10;
                this.speed = Math.random() * 2 + 1;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = Math.random() * 0.05 - 0.025;
                this.color = heartColors[Math.floor(Math.random() * heartColors.length)];
                this.opacity = Math.random() * 0.5 + 0.5;
                this.wobble = Math.random() * 5;
                this.wobbleSpeed = Math.random() * 0.02 + 0.01;
                this.wobbleOffset = Math.random() * Math.PI * 2;
            }
            
            update() {
                this.y += this.speed;
                this.rotation += this.rotationSpeed;
                this.wobbleOffset += this.wobbleSpeed;
                
                if (this.y > canvas.height + this.size) {
                    this.reset();
                }
            }
            
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.scale(1, 1 + Math.sin(this.wobbleOffset) * 0.1);
                
                ctx.beginPath();
                ctx.moveTo(0, 0 - this.size/2);
                ctx.bezierCurveTo(
                    0 + this.size/2, 0 - this.size/2,
                    0 + this.size/2, 0 + this.size/2,
                    0, 0 + this.size/2
                );
                ctx.bezierCurveTo(
                    0 - this.size/2, 0 + this.size/2,
                    0 - this.size/2, 0 - this.size/2,
                    0, 0 - this.size/2
                );
                
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.fill();
                ctx.restore();
            }
        }
        
        // Create hearts
        for (let i = 0; i < 30; i++) {
            hearts.push(new Heart());
        }
        
        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (const heart of hearts) {
                heart.update();
                heart.draw();
            }
            
            requestAnimationFrame(animate);
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            resizeCanvas();
        });
        
        // Initial load of comments when the page loads
        $(document).ready(function() {
            loadComments();
            animate(); // Start heart animation
            
            // Auto-play music after user interaction
            document.addEventListener('click', function() {
                const audio = document.getElementById('bucinMusic');
                if (audio.paused) {
                    audio.play().catch(e => console.log('Autoplay prevented:', e));
                }
            }, { once: true });
        });