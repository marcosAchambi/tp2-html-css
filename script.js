// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navButtons = document.querySelector('.nav-buttons');

    mobileMenuToggle.addEventListener('click', function() {
        this.classList.toggle('active');

        if (this.classList.contains('active')) {
            // Create mobile menu
            const mobileMenu = document.createElement('div');
            mobileMenu.className = 'mobile-menu';

            // Clone navigation items
            const navMenuClone = navMenu.cloneNode(true);
            const navButtonsClone = navButtons.cloneNode(true);

            mobileMenu.appendChild(navMenuClone);
            mobileMenu.appendChild(navButtonsClone);

            // Insert after nav-wrapper
            document.querySelector('.nav-wrapper').after(mobileMenu);

            // Animate spans for X icon
            this.children[0].style.transform = 'translateY(8px) rotate(45deg)';
            this.children[1].style.opacity = '0';
            this.children[2].style.transform = 'translateY(-8px) rotate(-45deg)';

            // Add slide-down animation
            setTimeout(() => {
                mobileMenu.style.height = mobileMenu.scrollHeight + 'px';
            }, 10);

        } else {
            // Remove mobile menu with animation
            const mobileMenu = document.querySelector('.mobile-menu');

            if (mobileMenu) {
                mobileMenu.style.height = '0';

                // Reset span styles
                this.children[0].style.transform = 'none';
                this.children[1].style.opacity = '1';
                this.children[2].style.transform = 'none';

                // Remove after animation completes
                setTimeout(() => {
                    mobileMenu.remove();
                }, 300);
            }
        }
    });
});
document.addEventListener('DOMContentLoaded', function() {
    // Valores objetivo para cada contador
    const targetValues = {
        counter1: 70,    // Sessions per day
        counter2: 1500,  // Sessions completed
        counter3: 50000, // Calories burned
        counter4: 75000  // Strikes delivered
    };

    // Configuración de la animación
    const animationDuration = 2000; // 2 segundos
    const incrementSpeed = 20; // velocidad de actualización en ms

    // Función para animar un contador
    function animateCounter(elementId, targetValue) {
        const counterElement = document.getElementById(elementId);
        if (!counterElement) return;

        let currentNumber = 0;

        // Aplicar animación CSS mejorada
        counterElement.style.animation = `countUp ${animationDuration/1000}s ease-out forwards`;

        // Intervalo para incrementar el número
        const interval = setInterval(() => {
            currentNumber += Math.ceil(targetValue / (animationDuration / incrementSpeed));

            // Asegurarse de no sobrepasar el objetivo
            if (currentNumber >= targetValue) {
                currentNumber = targetValue;
                clearInterval(interval);
            }

            // Actualizar el texto del contador
            counterElement.textContent = currentNumber.toLocaleString();
        }, incrementSpeed);
    }

    // Observer para iniciar la animación cuando la sección es visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Iniciar animaciones para todos los contadores
                for (const [counterId, targetValue] of Object.entries(targetValues)) {
                    animateCounter(counterId, targetValue);
                }
                // Desconectar el observer después de iniciar las animaciones
                observer.disconnect();
            }
        });
    }, { threshold: 0.2 }); // Iniciar cuando al menos 20% de la sección es visible

    // Observar la sección de estadísticas
    const statsSection = document.querySelector('.video-statistics-section');
    if (statsSection) {
        observer.observe(statsSection);
    }

    // Opcional: Reiniciar las animaciones al hacer clic en la sección
    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
        statsContainer.addEventListener('click', function(e) {
            // No reiniciar si se hace clic en el botón
            if (e.target.classList.contains('try-button')) {
                return;
            }

            // Reiniciar contadores
            for (const counterId of Object.keys(targetValues)) {
                const counterElement = document.getElementById(counterId);
                if (counterElement) {
                    counterElement.textContent = "0";
                    counterElement.style.animation = 'none';

                    // Forzar un reflow para que la animación se reinicie
                    void counterElement.offsetWidth;
                }
            }

            // Iniciar las animaciones nuevamente
            setTimeout(() => {
                for (const [counterId, targetValue] of Object.entries(targetValues)) {
                    animateCounter(counterId, targetValue);
                }
            }, 50);
        });
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.carousel-track');
    const cards = Array.from(document.querySelectorAll('.testimonial-card'));
    const dots = Array.from(document.querySelectorAll('.nav-dot'));

    let currentIndex = 2; // Start with the middle card active
    let startX, isDragging = false, startPos;

    // Initialize carousel
    updateCarousel();

    // Set up dot navigation
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            currentIndex = index;
            updateCarousel();
        });
    });

    // Touch and mouse events for swiping
    track.addEventListener('mousedown', startDrag);
    track.addEventListener('touchstart', startDrag, { passive: true });

    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag, { passive: true });

    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

    // Auto-play functionality
    let autoplayInterval = setInterval(nextSlide, 5000);

    track.addEventListener('mouseenter', () => {
        clearInterval(autoplayInterval);
    });

    track.addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(nextSlide, 5000);
    });

    function startDrag(e) {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        startPos = getCurrentTranslate();

        // Pause transitions during drag
        track.style.transition = 'none';
    }

    function drag(e) {
        if (!isDragging) return;

        const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        const diff = currentX - startX;

        // Move the track with the cursor/finger
        track.style.transform = `translateX(${startPos + diff}px)`;
    }

    function endDrag(e) {
        if (!isDragging) return;
        isDragging = false;

        // Restore transitions
        track.style.transition = 'transform 0.5s ease';

        const currentX = e.type.includes('mouse') ? e.pageX : (e.changedTouches ? e.changedTouches[0].clientX : startX);
        const diff = currentX - startX;

        // Determine if we should navigate based on drag distance
        if (Math.abs(diff) > 100) {
            if (diff > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        } else {
            // If the drag wasn't far enough, snap back
            updateCarousel();
        }
    }

    function getCurrentTranslate() {
        const style = window.getComputedStyle(track);
        const matrix = new WebKitCSSMatrix(style.transform);
        return matrix.m41;
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % cards.length;
        updateCarousel();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCarousel();
    }

    function updateCarousel() {
        // Calculate the position to center the current card
        const cardWidth = cards[0].offsetWidth + 20; // card width + margin
        const offset = -currentIndex * cardWidth + (track.offsetWidth / 2 - cardWidth / 2);

        // Update track position
        track.style.transform = `translateX(${offset}px)`;

        // Update active states
        cards.forEach((card, index) => {
            card.classList.toggle('active', index === currentIndex);
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        updateCarousel();
    });
});

// Inicialización del mapa de Google
function initMap() {
    // Coordenadas de ejemplo para San Salvador de Jujuy, Argentina
    const gymTopLocation = { lat: -24.186695, lng: -65.299711 };
    
    // Opciones de estilo para el mapa
    const mapOptions = {
        zoom: 15,
        center: gymTopLocation,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry",
                "stylers": [{"color": "#242f3e"}]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [{"lightness": -80}]
            },
            {
                "featureType": "administrative",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#746855"}]
            },
            {
                "featureType": "administrative.locality",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#d59563"}]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{"color": "#38414e"}]
            },
            {
                "featureType": "road",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#212a37"}]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#9ca5b3"}]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{"color": "#17263c"}]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#515c6d"}]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.stroke",
                "stylers": [{"lightness": -20}]
            }
        ]
    };

    // Crear el mapa
    const map = new google.maps.Map(document.getElementById("map"), mapOptions);
    
    // Crear contenido personalizado para el marcador
    const contentString =
        '<div style="padding: 10px; max-width: 200px;">' +
        '<h3 style="margin-top: 0; color: #0c0f30;">GymTop Equipment</h3>' +
        '<p>¡Visítanos y conoce nuestros productos de alta calidad!</p>' +
        '</div>';
    
    // Crear ventana de información
    const infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    
    // Crear marcador
    const marker = new google.maps.Marker({
        position: gymTopLocation,
        map: map,
        title: "GymTop Equipment",
        animation: google.maps.Animation.DROP,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#ff0055",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2
        }
    });
    
    // Abrir ventana de información al hacer clic en el marcador
    marker.addListener("click", () => {
        infowindow.open({
            anchor: marker,
            map,
        });
    });
    
    // Mostrar infowindow inicialmente
    infowindow.open({
        anchor: marker,
        map,
    });
}

// Verificar si el script de Google Maps se ha cargado
window.addEventListener('load', function() {
    // Comprobar si la función initMap ya está en el objeto window
    if (typeof window.initMap !== 'function') {
        window.initMap = initMap;
    }
});
// Script para ajustar la altura de las tarjetas en la galería masonry
document.addEventListener('DOMContentLoaded', function() {
    // Ajustar la altura de las tarjetas en la galería masonry
    const tarjetas = document.querySelectorAll('.tarjeta-clase');

    function resizeMasonryItems() {
        tarjetas.forEach(tarjeta => {
            const altura = tarjeta.querySelector('.tarjeta-imagen').offsetHeight +
                          tarjeta.querySelector('.tarjeta-info').offsetHeight;

            // Convertir altura a filas de la cuadrícula (cada fila es de 10px)
            const rowSpan = Math.ceil(altura / 10);
            tarjeta.style.gridRowEnd = `span ${rowSpan}`;
        });
    }

    // Ejecutar al cargar y al cambiar el tamaño de la ventana
    resizeMasonryItems();
    window.addEventListener('resize', resizeMasonryItems);
    window.addEventListener('load', resizeMasonryItems);

    // Añadir atributos data-label a las celdas de la tabla para vista móvil
    const tabla = document.querySelector('.tabla-horarios');
    if (tabla) {
        const filas = tabla.querySelectorAll('tbody tr');
        const encabezados = tabla.querySelectorAll('thead th');

        filas.forEach(fila => {
            const celdas = fila.querySelectorAll('td');
            celdas.forEach((celda, index) => {
                if (index < encabezados.length) {
                    celda.setAttribute('data-label', encabezados[index].textContent);
                }
            });
        });
    }

    // Navegación suave al hacer clic en los enlaces
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Funcionalidad para los filtros laterales con scroll dinámico
    const filtrosBtns = document.querySelectorAll('.filtros-laterales .filtro-btn');
    const secciones = document.querySelectorAll('.session-section');

    // Función para activar el filtro correspondiente al scroll
    function activarFiltroEnScroll() {
        const scrollPosition = window.scrollY + window.innerHeight / 2;

        secciones.forEach((seccion) => {
            const seccionTop = seccion.offsetTop;
            const seccionHeight = seccion.offsetHeight;
            const seccionId = seccion.getAttribute('id');

            if (scrollPosition >= seccionTop && scrollPosition < seccionTop + seccionHeight) {
                // Desactivar todos los filtros
                document.querySelectorAll('.filtros-laterales input[type="radio"]').forEach(radio => {
                    radio.checked = false;
                });

                // Activar el filtro correspondiente
                const filtroCorrespondiente = document.querySelector(`.filtros-laterales .filtro-btn[data-target="${seccionId}"]`);
                if (filtroCorrespondiente) {
                    const radioInput = document.getElementById(filtroCorrespondiente.getAttribute('for'));
                    if (radioInput) {
                        radioInput.checked = true;
                    }
                }
            }
        });
    }

    // Activar filtro al hacer clic
    filtrosBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Activar filtro al hacer scroll
    window.addEventListener('scroll', activarFiltroEnScroll);

    // Activar el filtro inicial al cargar la página
    activarFiltroEnScroll();

    // Simular clic en el botón de reproducción del video
    const playButton = document.querySelector('.play-button');
    if (playButton) {
        playButton.addEventListener('click', function() {
            alert('¡Video en reproducción! (Simulación)');
        });
    }
});
document.addEventListener('DOMContentLoaded', function() {
    // Animar las barras de habilidades cuando la página carga
    setTimeout(() => {
        const skillLevels = document.querySelectorAll('.skill-level');
        skillLevels.forEach(skill => {
            const width = skill.style.width;
            skill.style.width = '0';

            setTimeout(() => {
                skill.style.width = width;
            }, 100);
        });
    }, 500);

    // Animar las estrellas secuencialmente
    const stars = document.querySelectorAll('.star.active, .star.half');
    stars.forEach((star, index) => {
        setTimeout(() => {
            star.style.animation = 'pulse 1s ease-in-out';
        }, 200 * index);
    });

    // Añadir efecto hover a las tarjetas para dispositivos táctiles
    const cards = document.querySelectorAll('.trainer-card');
    cards.forEach(card => {
        card.addEventListener('touchstart', function() {
            this.classList.toggle('touch-hover');

            // Si la tarjeta tiene la clase touch-hover, girarla
            if (this.classList.contains('touch-hover')) {
                this.querySelector('.card-inner').style.transform = 'rotateY(180deg)';
            } else {
                this.querySelector('.card-inner').style.transform = 'rotateY(0)';
            }
        });
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formInputs = contactForm.querySelectorAll('input, select, textarea');
    const submitBtn = contactForm.querySelector('.submit-btn');
    const modal = document.getElementById('confirmationModal');
    const closeModal = document.querySelector('.close-modal');
    const modalBtn = document.querySelector('.modal-btn');

    // Validación en tiempo real
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            validateInput(this);
        });

        input.addEventListener('blur', function() {
            validateInput(this);
        });
    });

    function validateInput(input) {
        const validationMessage = input.nextElementSibling;

        if (input.validity.valid) {
            validationMessage.textContent = '';
            input.classList.remove('invalid');
            input.classList.add('valid');
        } else {
            showError(input, validationMessage);
        }
    }

    function showError(input, validationMessage) {
        input.classList.add('invalid');
        input.classList.remove('valid');

        if (input.validity.valueMissing) {
            validationMessage.textContent = 'Este campo es obligatorio';
        } else if (input.validity.typeMismatch) {
            if (input.type === 'email') {
                validationMessage.textContent = 'Introduce un correo electrónico válido';
            }
        } else if (input.validity.patternMismatch) {
            if (input.id === 'phone') {
                validationMessage.textContent = 'Introduce un número de teléfono válido (9 dígitos)';
            }
        }
    }

    // Envío del formulario
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        let isValid = true;

        // Validar todos los campos antes de enviar
        formInputs.forEach(input => {
            if (!input.validity.valid) {
                isValid = false;
                validateInput(input);
            }
        });

        if (isValid) {
            // Mostrar spinner de carga
            submitBtn.classList.add('loading');

            // Simular envío (reemplazar con tu lógica de envío real)
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                showModal();
                contactForm.reset();

                // Resetear estados de validación
                formInputs.forEach(input => {
                    input.classList.remove('valid', 'invalid');
                    const validationMessage = input.nextElementSibling;
                    if (validationMessage) {
                        validationMessage.textContent = '';
                    }
                });
            }, 2000);
        }
    });

    // Funciones del modal
    function showModal() {
        modal.style.display = 'flex';
    }

    function hideModal() {
        modal.style.display = 'none';
    }

    closeModal.addEventListener('click', hideModal);
    modalBtn.addEventListener('click', hideModal);

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideModal();
        }
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const billingToggle = document.getElementById('billingToggle');
    const monthlyLabel = document.querySelector('.toggle-label:first-child');
    const annualLabel = document.querySelector('.toggle-label:last-child');
    const monthlyPrices = document.querySelectorAll('.amount.monthly');
    const annualPrices = document.querySelectorAll('.amount.annual');

    // Toggle entre facturación mensual y anual
    billingToggle.addEventListener('change', function() {
        if (this.checked) {
            // Anual
            monthlyPrices.forEach(price => {
                price.style.display = 'none';
            });

            annualPrices.forEach(price => {
                price.style.display = 'inline';
            });

            monthlyLabel.classList.remove('active');
            annualLabel.classList.add('active');
        } else {
            // Mensual
            monthlyPrices.forEach(price => {
                price.style.display = 'inline';
            });

            annualPrices.forEach(price => {
                price.style.display = 'none';
            });

            monthlyLabel.classList.add('active');
            annualLabel.classList.remove('active');
        }
    });

    // Efecto hover en las tarjetas de precios
    const pricingCards = document.querySelectorAll('.pricing-card');

    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('popular')) {
                pricingCards.forEach(c => {
                    if (c !== this && !c.classList.contains('popular')) {
                        c.style.opacity = '0.7';
                    }
                });
            }
        });

        card.addEventListener('mouseleave', function() {
            pricingCards.forEach(c => {
                c.style.opacity = '1';
            });
        });
    });
});
document.addEventListener('DOMContentLoaded', function() {
    // Filtrado de artículos por categoría
    const filterTags = document.querySelectorAll('.filter-tag');
    const blogPosts = document.querySelectorAll('.blog-post');

    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // Actualizar estado activo de los botones
            filterTags.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');

            // Filtrar artículos
            blogPosts.forEach(post => {
                if (filter === 'all') {
                    post.style.display = 'block';

                    // Reiniciar animación
                    post.style.animation = 'none';
                    post.offsetHeight; // Trigger reflow
                    post.style.animation = null;

                    // Aplicar animación con retraso
                    const index = Array.from(blogPosts).indexOf(post);
                    post.style.animationDelay = `${index * 0.2}s`;
                } else {
                    const categories = post.getAttribute('data-category').split(' ');

                    if (categories.includes(filter)) {
                        post.style.display = 'block';

                        // Reiniciar animación
                        post.style.animation = 'none';
                        post.offsetHeight; // Trigger reflow
                        post.style.animation = null;

                        // Aplicar animación con retraso
                        const visiblePosts = Array.from(blogPosts).filter(p =>
                            p.getAttribute('data-category').split(' ').includes(filter)
                        );
                        const index = visiblePosts.indexOf(post);
                        post.style.animationDelay = `${index * 0.2}s`;
                    } else {
                        post.style.display = 'none';
                    }
                }
            });
        });
    });

    // Efecto Scroll Reveal
    function checkScroll() {
        const triggerBottom = window.innerHeight * 0.8;

        blogPosts.forEach(post => {
            const postTop = post.getBoundingClientRect().top;

            if (postTop < triggerBottom) {
                post.style.opacity = '1';
                post.style.transform = 'translateY(0)';
            }
        });
    }

    // Inicializar el efecto de scroll
    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Comprobar al cargar la página

    // Interacción con los comentarios
    const likeButtons = document.querySelectorAll('.comment-like');

    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const likeCount = parseInt(this.textContent.match(/\d+/)[0]);

            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                this.innerHTML = `<i class="fas fa-heart"></i> ${likeCount + 1}`;
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                this.innerHTML = `<i class="far fa-heart"></i> ${likeCount - 1}`;
            }
        });
    });

    // Formulario de comentarios
    const commentForm = document.querySelector('.comment-form form');

    commentForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const nameInput = document.getElementById('comment-name');
        const commentText = document.getElementById('comment-text');

        if (nameInput.value.trim() !== '' && commentText.value.trim() !== '') {
            // Crear nuevo comentario
            const newComment = document.createElement('div');
            newComment.className = 'comment';

            // Obtener iniciales para el avatar
            const nameParts = nameInput.value.trim().split(' ');
            let initials = '';

            if (nameParts.length > 0) {
                initials += nameParts[0].charAt(0).toUpperCase();

                if (nameParts.length > 1) {
                    initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
                }
            }

            const currentDate = new Date();

            newComment.innerHTML = `
                <div class="comment-avatar" data-initials="${initials}"></div>
                <div class="comment-content">
                    <div class="comment-header">
                        <h4>${nameInput.value.trim()}</h4>
                        <span class="comment-date">Hace un momento</span>
                    </div>
                    <p>${commentText.value.trim()}</p>
                    <div class="comment-actions">
                        <button class="comment-like"><i class="far fa-heart"></i> 0</button>
                        <button class="comment-reply">Responder</button>
                    </div>
                </div>
            `;

            // Añadir el nuevo comentario al principio de la lista
            const commentsContainer = document.querySelector('.comments-container');
            commentsContainer.insertBefore(newComment, commentsContainer.firstChild);

            // Limpiar el formulario
            commentForm.reset();

            // Añadir evento al nuevo botón de like
            const newLikeButton = newComment.querySelector('.comment-like');
            newLikeButton.addEventListener('click', function() {
                const icon = this.querySelector('i');
                const likeCount = parseInt(this.textContent.match(/\d+/)[0]);

                if (icon.classList.contains('far')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    this.innerHTML = `<i class="fas fa-heart"></i> ${likeCount + 1}`;
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    this.innerHTML = `<i class="far fa-heart"></i> ${likeCount - 1}`;
                }
            });
        }
    });
});