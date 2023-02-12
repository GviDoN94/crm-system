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

    // const select = document.querySelector('.contact__select');
    // new Choices(select, {
    //     itemSelectText: '',
    //     searchEnabled: false,
    //     position: 'bottom',
    //     shouldSort: false,
    // });
});
