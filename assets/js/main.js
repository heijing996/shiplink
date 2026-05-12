document.addEventListener('DOMContentLoaded', () => {
    const pageLang = document.documentElement.lang || 'zh-CN';
    const normalizedLang = pageLang.toLowerCase();
    const currentLang = normalizedLang.startsWith('en') ? 'en' : (normalizedLang.includes('hant') ? 'zh-Hant' : 'zh-CN');
    const i18n = {
        'zh-CN': {
            serviceLabels: {
                'sea-freight': '国际海运询价',
                'air-freight': '国际空运询价',
                'land-transport': '拖车/陆运询价',
                customs: '报关服务询价',
                warehousing: '仓储配送询价',
                'ecommerce-logistics': '小批量/跨境物流询价',
            },
            submitting: '<i class="fas fa-spinner fa-spin mr-2"></i> 正在提交',
            success: '留言已提交，我们会尽快通过电话、微信、WhatsApp 或邮箱回复。',
            error: '提交失败。请直接通过电话 / 微信 / WhatsApp 联系：0086-13129567120。',
            inquiryError: '请稍后重试，或直接通过电话 / 微信 / WhatsApp 联系：0086-13129567120。',
        },
        en: {
            serviceLabels: {
                'sea-freight': 'Sea freight quote',
                'air-freight': 'Air freight quote',
                'land-transport': 'Trucking / inland transport quote',
                customs: 'Customs clearance inquiry',
                warehousing: 'Warehousing and delivery inquiry',
                'ecommerce-logistics': 'Small-batch / cross-border logistics inquiry',
            },
            submitting: '<i class="fas fa-spinner fa-spin mr-2"></i> Submitting',
            success: 'Your message has been submitted. We will reply by phone, WeChat, WhatsApp or email as soon as possible.',
            error: 'Submission failed. Please contact us directly by phone / WeChat / WhatsApp: 0086-13129567120.',
            inquiryError: 'Please try again later, or contact us directly by phone / WeChat / WhatsApp: 0086-13129567120.',
        },
        'zh-Hant': {
            serviceLabels: {
                'sea-freight': '國際海運詢價',
                'air-freight': '國際空運詢價',
                'land-transport': '拖車 / 陸運詢價',
                customs: '報關服務詢價',
                warehousing: '倉儲配送詢價',
                'ecommerce-logistics': '小批量 / 跨境物流詢價',
            },
            submitting: '<i class="fas fa-spinner fa-spin mr-2"></i> 正在提交',
            success: '留言已提交，我們會盡快透過電話、微信、WhatsApp 或電子郵箱回覆。',
            error: '提交失敗。請直接透過電話 / 微信 / WhatsApp 聯絡：0086-13129567120。',
            inquiryError: '請稍後重試，或直接透過電話 / 微信 / WhatsApp 聯絡：0086-13129567120。',
        },
    };
    const messages = i18n[currentLang];
    function setupFormspreeForm(formId, successId, errorId, feedbackId) {
        const form = document.getElementById(formId);
        const successSection = successId ? document.getElementById(successId) : null;
        const errorSection = errorId ? document.getElementById(errorId) : null;
        const feedback = feedbackId ? document.getElementById(feedbackId) : null;

        if (!form || !form.action) {
            return;
        }

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton ? submitButton.innerHTML : '';

            if (successSection) {
                successSection.classList.add('hidden');
            }

            if (errorSection) {
                errorSection.classList.add('hidden');
            }

            if (feedback) {
                feedback.className = 'mt-6 hidden';
                feedback.textContent = '';
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = messages.submitting;
            }

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: {
                        Accept: 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Formspree submission failed');
                }

                form.reset();

                if (successSection) {
                    successSection.classList.remove('hidden');
                    successSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }

                if (feedback) {
                    feedback.className = 'mt-6 rounded-md border border-green-700 bg-green-900 bg-opacity-30 px-4 py-3 text-green-300';
                    feedback.textContent = messages.success;
                }
            } catch (error) {
                if (errorSection) {
                    const errorMessageNode = errorSection.querySelector('span');
                    if (errorMessageNode) {
                        errorMessageNode.textContent = messages.inquiryError;
                    }
                    errorSection.classList.remove('hidden');
                    errorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }

                if (feedback) {
                    feedback.className = 'mt-6 rounded-md border border-red-700 bg-red-900 bg-opacity-30 px-4 py-3 text-red-300';
                    feedback.textContent = messages.error;
                }
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalText;
                }
            }
        });
    }

    document.querySelectorAll('[aria-controls]').forEach((button) => {
        const menuId = button.getAttribute('aria-controls');
        const menu = menuId ? document.getElementById(menuId) : null;

        if (!menu) {
            return;
        }

        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!isExpanded));
            menu.classList.toggle('hidden');

            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    });

    document.querySelectorAll('[data-current-year]').forEach((node) => {
        node.textContent = String(new Date().getFullYear());
    });

    const params = new URLSearchParams(window.location.search);
    const subject = params.get('subject');
    const service = params.get('service');
    const contactSubject = document.getElementById('contact-subject');
    const cargoRemarks = document.getElementById('cargoRemarks');
    const cargoMode = document.getElementById('cargoMode');

    if (contactSubject && subject) {
        contactSubject.value = subject;
    }

    if (service && cargoRemarks) {
        const serviceLabel = messages.serviceLabels[service] || service;
        const servicePrefix = currentLang === 'en' ? 'Service: ' : (currentLang === 'zh-Hant' ? '諮詢服務：' : '咨询服务：');
        cargoRemarks.value = `${servicePrefix}${serviceLabel}`;
    }

    if (service && cargoMode) {
        const cargoModeMap = {
            'sea-freight': 'LCL',
            'air-freight': 'Air',
            'land-transport': 'Land',
            'ecommerce-logistics': 'Multimodal',
        };

        if (cargoModeMap[service]) {
            cargoMode.value = cargoModeMap[service];
        }
    }

    setupFormspreeForm('inquiryForm', 'inquiry-success-section', 'inquiry-error-section');
    setupFormspreeForm('contactForm', null, null, 'contact-form-feedback');

    const newInquiryBtn = document.getElementById('newInquiryBtn');
    const inquirySuccessSection = document.getElementById('inquiry-success-section');
    const inquiryForm = document.getElementById('inquiryForm');

    if (newInquiryBtn && inquirySuccessSection && inquiryForm) {
        newInquiryBtn.addEventListener('click', () => {
            inquirySuccessSection.classList.add('hidden');
            inquiryForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
});
