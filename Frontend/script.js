/* =========================================================
   PERPETUAL MEDTECH — FINAL FRONTEND SCRIPT
   =========================================================
   Includes:
   - Mobile navigation
   - Smooth navigation
   - Scroll progress
   - Scroll reveal animations
   - Product API loading
   - Product image loading
   - Contact form submission
   - Form validation
   - Live cursor ambience
   - Cursor hover effects
   ========================================================= */

const API_BASE_URL = "https://perpetual-medtech.vercel.app";


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       MOBILE NAVIGATION
       ===================================================== */

    const menuBtn = document.getElementById("menuBtn");
    const navLinks = document.getElementById("navLinks");

    if (menuBtn && navLinks) {

        menuBtn.addEventListener("click", function () {

            navLinks.classList.toggle("active");
            menuBtn.classList.toggle("active");

            const expanded =
                navLinks.classList.contains("active");

            menuBtn.setAttribute(
                "aria-expanded",
                expanded ? "true" : "false"
            );

        });


        navLinks.querySelectorAll("a").forEach(function (link) {

            link.addEventListener("click", function () {

                navLinks.classList.remove("active");
                menuBtn.classList.remove("active");

                menuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });

    }


    /* =====================================================
       SMOOTH ANCHOR NAVIGATION
       ===================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(function (link) {

            link.addEventListener("click", function (event) {

                const targetId =
                    link.getAttribute("href");

                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }

                const target =
                    document.querySelector(targetId);

                if (!target) {
                    return;
                }

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            });

        });


    /* =====================================================
       SCROLL PROGRESS
       ===================================================== */

    const scrollProgress =
        document.querySelector(".scroll-progress");


    function updateScrollProgress() {

        if (!scrollProgress) {
            return;
        }

        const scrollTop =
            window.scrollY ||
            document.documentElement.scrollTop;

        const documentHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const progress =
            documentHeight > 0
                ? (scrollTop / documentHeight) * 100
                : 0;

        scrollProgress.style.width =
            Math.min(
                100,
                Math.max(0, progress)
            ) + "%";

    }


    window.addEventListener(
        "scroll",
        updateScrollProgress,
        {
            passive: true
        }
    );


    updateScrollProgress();


    /* =====================================================
       SCROLL REVEAL ANIMATIONS
       ===================================================== */

    const revealElements =
        document.querySelectorAll(
            ".reveal, " +
            ".reveal-left, " +
            ".reveal-right, " +
            ".reveal-scale"
        );


    if ("IntersectionObserver" in window) {

        const revealObserver =
            new IntersectionObserver(
                function (entries, observer) {

                    entries.forEach(function (entry) {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        entry.target.classList.add(
                            "visible"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    });

                },
                {
                    threshold: 0.12,
                    rootMargin:
                        "0px 0px -50px 0px"
                }
            );


        revealElements.forEach(function (element) {

            revealObserver.observe(element);

        });

    } else {

        revealElements.forEach(function (element) {

            element.classList.add(
                "visible"
            );

        });

    }


    /* =====================================================
       PRODUCT API
       ===================================================== */

    const productsGrid =
        document.getElementById("productsGrid");


    async function loadProducts() {

        if (!productsGrid) {
            console.warn(
                "productsGrid element was not found."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/products`
                );


            if (!response.ok) {

                throw new Error(
                    "Product API returned HTTP " +
                    response.status
                );

            }


            const data =
                await response.json();


            console.log(
                "Product API response:",
                data
            );


            if (
                data.status !== "success" ||
                !Array.isArray(data.products)
            ) {

                throw new Error(
                    "Invalid product data received."
                );

            }


            productsGrid.innerHTML = "";


            /* ---------------------------------------------
               NO PRODUCTS
               --------------------------------------------- */

            if (data.products.length === 0) {

                productsGrid.innerHTML = `
                    <p class="product-error">
                        No products are currently available.
                    </p>
                `;

                return;

            }


            /* ---------------------------------------------
               CREATE PRODUCT CARDS
               --------------------------------------------- */

            data.products.forEach(function (product) {


                const productCard =
                    document.createElement(
                        "article"
                    );


                productCard.className =
                    "product-card";


                /* -----------------------------------------
                   GET IMAGE FILE NAME
                   ----------------------------------------- */

                const rawImage =
                    product.image_url || "";


                const fileName =
                    rawImage
                        .split("/")
                        .pop()
                        .trim();


                /* -----------------------------------------
                   PRODUCT IMAGE PATH

                   Your structure:

                   Frontend/
                   ├── index.html
                   ├── script.js
                   ├── style.css
                   └── Images/
                       └── products/
                           ├── product-1.jpg
                           ├── product-2.jpg
                           └── product-3.jpg

                   Therefore the correct relative path is:

                   Images/products/product-1.jpg
                   ----------------------------------------- */

                const imagePath =
                    `Images/products/${fileName}`;


                console.log(
                    "Database image:",
                    product.image_url
                );


                console.log(
                    "Product image path:",
                    imagePath
                );


                /* -----------------------------------------
                   PRODUCT CARD HTML
                   ----------------------------------------- */

                productCard.innerHTML = `

                    <div class="product-image">

                        <img
                            src="${imagePath}"
                            alt="${escapeHtml(
                                product.name
                            )}"
                            loading="lazy"
                        >

                    </div>


                    <div class="product-content">

                        <span class="product-category">

                            ${escapeHtml(
                                product.category ||
                                "Medical Technology"
                            )}

                        </span>


                        <h3>

                            ${escapeHtml(
                                product.name
                            )}

                        </h3>


                        <p>

                            ${escapeHtml(
                                product.description ||
                                ""
                            )}

                        </p>


                        <a
                            href="#contact"
                            class="product-btn"
                        >

                            View Details

                            <span>
                                →
                            </span>

                        </a>

                    </div>

                `;


                /* -----------------------------------------
                   IMAGE ERROR HANDLING
                   ----------------------------------------- */

                const productImage =
                    productCard.querySelector(
                        ".product-image img"
                    );


                if (productImage) {

                    productImage.addEventListener(
                        "load",
                        function () {

                            console.log(
                                "IMAGE LOADED:",
                                imagePath
                            );

                        }
                    );


                    productImage.addEventListener(
                        "error",
                        function () {

                            console.error(
                                "IMAGE FAILED:",
                                imagePath
                            );

                        }
                    );

                }


                productsGrid.appendChild(
                    productCard
                );

            });


            console.log(
                "Products loaded successfully:",
                data.products.length
            );


            /*
             * Product cards are created dynamically,
             * so attach cursor hover effects again.
             */

            attachCursorHoverTargets();


        } catch (error) {

            console.error(
                "Product loading error:",
                error
            );


            productsGrid.innerHTML = `

                <p class="product-error">

                    Unable to load products.
                    Please try again later.

                </p>

            `;

        }

    }


    loadProducts();


    /* =====================================================
       CONTACT FORM
       ===================================================== */

    const contactForm =
        document.getElementById(
            "contactForm"
        );


    const formMessage =
        document.getElementById(
            "formMessage"
        );


    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const submitButton =
                    contactForm.querySelector(
                        'button[type="submit"]'
                    );


                /* -----------------------------------------
                   GET FORM VALUES
                   ----------------------------------------- */

                const name =
                    document
                        .getElementById("name")
                        ?.value
                        .trim();


                const email =
                    document
                        .getElementById("email")
                        ?.value
                        .trim();


                const subject =
                    document
                        .getElementById("subject")
                        ?.value
                        .trim();


                const message =
                    document
                        .getElementById("message")
                        ?.value
                        .trim();


                /* -----------------------------------------
                   EMPTY FIELD VALIDATION
                   ----------------------------------------- */

                if (
                    !name ||
                    !email ||
                    !subject ||
                    !message
                ) {

                    showFormMessage(
                        "Please fill in all fields.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   EMAIL VALIDATION
                   ----------------------------------------- */

                const emailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                if (
                    !emailPattern.test(email)
                ) {

                    showFormMessage(
                        "Please enter a valid email address.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   DISABLE SUBMIT BUTTON
                   ----------------------------------------- */

                if (submitButton) {

                    submitButton.disabled =
                        true;


                    submitButton.dataset.originalText =
                        submitButton.innerHTML;


                    submitButton.innerHTML =
                        "Sending...";

                }


                showFormMessage(
                    "Sending your message...",
                    "loading"
                );


                /* -----------------------------------------
                   SEND DATA TO FASTAPI
                   ----------------------------------------- */

                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/contact`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        name:
                                            name,

                                        email:
                                            email,

                                        subject:
                                            subject,

                                        message:
                                            message
                                    })
                            }
                        );


                    const data =
                        await response.json();


                    if (
                        !response.ok ||
                        data.status !== "success"
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to submit your message."
                        );

                    }


                    /* -------------------------------------
                       SUCCESS
                       ------------------------------------- */

                    showFormMessage(
                        "Thank you. Your message has been sent successfully.",
                        "success"
                    );


                    contactForm.reset();


                } catch (error) {

                    console.error(
                        "Contact form error:",
                        error
                    );


                    showFormMessage(
                        "Something went wrong. Please try again later.",
                        "error"
                    );


                } finally {

                    if (submitButton) {

                        submitButton.disabled =
                            false;


                        submitButton.innerHTML =
                            submitButton
                                .dataset
                                .originalText ||
                            "Send Message →";

                    }

                }

            }
        );

    }


    /* =====================================================
       FORM MESSAGE FUNCTION
       ===================================================== */

    function showFormMessage(
        message,
        type
    ) {

        if (!formMessage) {
            return;
        }


        formMessage.textContent =
            message;


        formMessage.className =
            "form-message " +
            type;

    }


    /* =====================================================
       LIVE CURSOR AMBIENCE
       ===================================================== */

    initCursorAmbience();

});


/* =========================================================
   HTML ESCAPE HELPER
   ========================================================= */

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   LIVE CURSOR AMBIENCE
   ========================================================= */

function initCursorAmbience() {


    /*
     * Disable cursor ambience on touch devices.
     */

    if (
        window.matchMedia &&
        window.matchMedia(
            "(hover: none), (pointer: coarse)"
        ).matches
    ) {

        return;

    }


    /* ---------------------------------------------
       CREATE CURSOR AMBIENCE ELEMENT
       --------------------------------------------- */

    const ambience =
        document.createElement(
            "div"
        );


    ambience.className =
        "cursor-ambience";


    document.body.appendChild(
        ambience
    );


    /* ---------------------------------------------
       MOUSE POSITION
       --------------------------------------------- */

    let mouseX =
        window.innerWidth / 2;


    let mouseY =
        window.innerHeight / 2;


    let currentX =
        mouseX;


    let currentY =
        mouseY;


    /* ---------------------------------------------
       MOUSE MOVE
       --------------------------------------------- */

    document.addEventListener(
        "mousemove",
        function (event) {

            mouseX =
                event.clientX;


            mouseY =
                event.clientY;


            document.body.classList.add(
                "cursor-active"
            );

        },
        {
            passive: true
        }
    );


    /* ---------------------------------------------
       MOUSE LEAVE
       --------------------------------------------- */

    document.addEventListener(
        "mouseleave",
        function () {

            document.body.classList.remove(
                "cursor-active"
            );


            document.body.classList.remove(
                "cursor-hover"
            );

        }
    );


    /* ---------------------------------------------
       HOVER TARGETS
       --------------------------------------------- */

    attachCursorHoverTargets();


    /* ---------------------------------------------
       ANIMATE CURSOR
       --------------------------------------------- */

    function animateCursor() {

        currentX +=
            (mouseX - currentX) *
            0.12;


        currentY +=
            (mouseY - currentY) *
            0.12;


        ambience.style.left =
            currentX + "px";


        ambience.style.top =
            currentY + "px";


        requestAnimationFrame(
            animateCursor
        );

    }


    animateCursor();

}


/* =========================================================
   CURSOR HOVER TARGETS
   ========================================================= */

function attachCursorHoverTargets() {


    const targets =
        document.querySelectorAll(
            "a, " +
            "button, " +
            "input, " +
            "textarea, " +
            "select, " +
            ".product-card, " +
            ".feature-card, " +
            ".research-card, " +
            ".team-card"
        );


    targets.forEach(function (element) {


        /*
         * Prevent duplicate event listeners.
         */

        if (
            element.dataset.cursorAttached ===
            "true"
        ) {

            return;

        }


        element.dataset.cursorAttached =
            "true";


        /* -----------------------------------------
           MOUSE ENTER
           ----------------------------------------- */

        element.addEventListener(
            "mouseenter",
            function () {

                document.body.classList.add(
                    "cursor-hover"
                );

            }
        );


        /* -----------------------------------------
           MOUSE LEAVE
           ----------------------------------------- */

        element.addEventListener(
            "mouseleave",
            function () {

                document.body.classList.remove(
                    "cursor-hover"
                );

            }
        );

    });

}