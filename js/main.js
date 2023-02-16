'use strict';

window.addEventListener('DOMContentLoaded', () => {
    function renderElement(element, parent) {
        parent.append(element);
    }
    
    function createElement(name, parent, text = '', classesEl = []) {
        const element = document.createElement(name);
        if (classesEl.length) {
        element.classList.add(...classesEl);
        }
        if(text) {
        element.textContent = text;
        }
        renderElement(element, parent);
        return element;
    }

    function openModal(modal) {
        const modalContent = modal.querySelector('.modal__content');
        modal.classList.add('is-open-modal');
        modalContent.classList.add('modal-open');
        setTimeout(() => modalContent.classList.add('animate-open'), 300);
    }

    function closeModal(modal) {
        modal.classList.remove('is-open-modal');
        modal.querySelector('.modal__content')
             .classList.remove('modal-open', 'animate-open');
    }

    function createContactInput (parent, showDeleteBtn = false) {
        const contact = createElement('div', parent, '', ['contact']);
        if (showDeleteBtn) {
            contact.classList.add('show-delete-btn');
        }
        contact.innerHTML =
            `
                <select class="contact__select" name="" id="">
                    <option value="">Телефон</option>
                    <option value="">Доп. телефон</option>
                    <option value="">Email</option>
                    <option value="">Vk</option>
                    <option value="">Facebook</option>
                </select>
                <input
                    class="contact__input"
                    type="text"
                    placeholder="Введите данные контакта"
                >
                <button class="btn-reset contact__delete-btn" type="button">
                    <svg
                        class="contact__svg-delete"
                        width="12" height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6
                            12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6
                            10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354
                            1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646
                            8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3
                            3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9
                            8.154L6.846 6L9 3.846L8.154 3Z"
                        />
                    </svg>                                    
                </button>
            `;
        new Choices(contact.querySelector('.contact__select'), {
            itemSelectText: '',
            searchEnabled: false,
            position: 'bottom',
            shouldSort: false,
        });
    }

    async function postData(url, data) {
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await result.json();
    }

    const modalAdd = document.querySelector('#modal-add'),
          formAdd = modalAdd.querySelector('.modal-form'),
          inputsFormAdd = formAdd.querySelectorAll('.modal-form__input'),
          contactsContainerForm = formAdd.querySelector('.modal-form__contacts-container'),
          errorsFormAdd = formAdd.querySelector('.modal-form__errors-box'),
          acceptAddBtn = formAdd.querySelector('.accept-btn'),
          modalChange = document.querySelector('#modal-change'),
          modalDelete = document.querySelector('#modal-delete');

    document.querySelector('.add-client-btn').addEventListener('click', () => {
        openModal(modalAdd);
    });

    modalAdd.addEventListener('click', e => {
        const event = e.target;
        if (event === modalAdd ||
            event.closest('.close-btn') ||
            event.closest('.cansel-btn')) {
            closeModal(modalAdd);
            formAdd.reset();
            errorsFormAdd.innerHTML = '';
            inputsFormAdd.forEach(input =>
                input.classList.remove('modal-form__input--error')
            );
        }
    });

    document.querySelectorAll('.modal-form__input').forEach(input => {
        input.addEventListener('change', () => {
            if (input.value) {
                input.nextElementSibling
                     .classList.add('modal-form__placeholder--small');
            } else {
                input.nextElementSibling
                     .classList.remove('modal-form__placeholder--small');
            }
        });
    });

    formAdd.addEventListener('submit', e => {
        e.preventDefault();
        errorsFormAdd.innerHTML = '';
        acceptAddBtn.classList.add('accept-btn--load');
        acceptAddBtn.disabled = true;

        const formData = new FormData(formAdd),
              newClient = Object.fromEntries(formData.entries());

        postData('http://localhost:3500/api/clients', newClient)
            .then((data) => {
                if (data.errors) {
                    data.errors.forEach(error => {
                        createElement('span', errorsFormAdd, error.message);
                        inputsFormAdd.forEach(input => {
                            if (input.name === error.field) {
                                input.classList.add('modal-form__input--error');
                            }
                        });
                    });
                } else {
                    formAdd.reset();
                    closeModal(modalAdd);
                }
            })
            .catch(() =>
                createElement('span', errorsFormAdd, 'Что-то пошло не так')
            )
            .finally(() => {
                acceptAddBtn.classList.remove('accept-btn--load');
                acceptAddBtn.disabled = false;
            });
    });
});
