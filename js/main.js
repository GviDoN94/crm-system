'use strict';

window.addEventListener('DOMContentLoaded', () => {
    const modalAdd = document.querySelector('#modal-add'),
          modalChange = document.querySelector('#modal-change'),
          modalDelete = document.querySelector('#modal-delete');

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

    document.querySelector('.add-client-btn').addEventListener('click', () => {
        openModal(modalAdd);
    });

    modalAdd.addEventListener('click', e => {
        const event = e.target;
        if (event === modalAdd ||
            event.closest('.close-btn') ||
            event.closest('.cansel-btn')) {
            closeModal(modalAdd);
        }
    });
});
