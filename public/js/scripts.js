


document.addEventListener('DOMContentLoaded', async () => {
    const propertyList = document.getElementById('property-list');
    const searchForm = document.getElementById('search-form');
    const localGovernmentSelect = document.getElementById('local-government');
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (window.location.pathname === '/') {
        await loadProperties();

        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const localGovernment = localGovernmentSelect.value;
            await loadProperties(localGovernment);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const response = await fetch('/api/register', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                alert('Registration successful');
                window.location.href = '/login.html'; // Redirect to login page
            } else {
                alert('Error registering user');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const response = await fetch('/api/login', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                alert('Login successful');
                window.location.href = '/upload'; // Redirect to upload page
            } else {
                alert('Invalid credentials');
            }
        });
    }

    async function loadProperties(localGovernment = '') {
        propertyList.innerHTML = ''; // Clear existing properties
        const response = await fetch(`/properties?localGovernment=${localGovernment}`);
        const properties = await response.json();

        if (properties.length === 0) {
            const message = document.createElement('p');
            message.textContent = 'No properties found.';
            propertyList.appendChild(message);
        } else {
            properties.forEach(property => {
                const propertyCard = document.createElement('div');
                propertyCard.className = 'col-md-4 mb-4';
                propertyCard.innerHTML = `
                    <div class="card">
                        <img class="card-img-top" src="/images/${property.image}" alt="${property.title}">
                        <div class="card-body">
                            <h5 class="card-title">${property.title}</h5>
                            <p class="card-text"><strong>Location:</strong> ${property.location}</p>
                            <button class="btn btn-primary btn-more-info" data-property-id="${property._id}">More Info</button>
                            <button class="btn btn-warning btn-edit" data-property-id="${property._id}">Edit</button>
                            <button class="btn btn-danger btn-delete" data-property-id="${property._id}">Delete</button>
                        </div>
                    </div>
                `;
                propertyList.appendChild(propertyCard);
            });

            // Reattach event listeners for More Info buttons after loading properties
            document.querySelectorAll('.btn-more-info').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const propertyId = btn.getAttribute('data-property-id');
                    const propertyResponse = await fetch(`/property/${propertyId}`);
                    const propertyData = await propertyResponse.json();
                    populateModal(propertyData);
                });
            });

            // Attach event listeners for Edit and Delete buttons
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', () => {
                    const propertyId = btn.getAttribute('data-property-id');
                    openEditModal(propertyId);
                });
            });

            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const propertyId = btn.getAttribute('data-property-id');
                    await deleteProperty(propertyId);
                });
            });
        }
    }

    // Function to populate modal with property details
    function populateModal(property) {
        const modalBody = document.getElementById('propertyModalBody');
        modalBody.innerHTML = `
            <img class="img-fluid" src="/images/${property.image}" alt="Property image">
            <h3>${property.title}</h3>
            <p>${property.description}</p>
            <ul>
                <li>Location: ${property.location}</li>
                <li>Email: ${property.email}</li>
                <li>Phone: ${property.phone}</li>
                <li>Local Government: ${property.localGovernment}</li>
            </ul>
        `;

        $('#propertyModal').modal('show'); // Show the modal
    }

    // Function to open the edit modal and populate it with property data
    async function openEditModal(propertyId) {
        const propertyResponse = await fetch(`/property/${propertyId}`);
        const propertyData = await propertyResponse.json();

        const editForm = document.getElementById('editPropertyForm');
        editForm.querySelector('input[name="title"]').value = propertyData.title;
        editForm.querySelector('input[name="location"]').value = propertyData.location;
        editForm.querySelector('textarea[name="description"]').value = propertyData.description;
        editForm.querySelector('input[name="email"]').value = propertyData.email;
        editForm.querySelector('input[name="phone"]').value = propertyData.phone;
        editForm.querySelector('input[name="localGovernment"]').value = propertyData.localGovernment;
        editForm.setAttribute('data-property-id', propertyId);

        $('#editPropertyModal').modal('show');
    }

    // Function to handle the edit form submission
    const editPropertyForm = document.getElementById('editPropertyForm');
    editPropertyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const propertyId = editPropertyForm.getAttribute('data-property-id');
        const formData = new FormData(editPropertyForm);

        const response = await fetch(`/api/property/${propertyId}`, {
            method: 'PUT',
            body: formData,
        });

        if (response.ok) {
            alert('Property updated successfully');
            $('#editPropertyModal').modal('hide');
            await loadProperties();
        } else {
            alert('Error updating property');
        }
    });

    // Function to delete a property
    async function deleteProperty(propertyId) {
        const response = await fetch(`/api/property/${propertyId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Property deleted successfully');
            await loadProperties();
        } else {
            alert('Error deleting property');
        }
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const propertyList = document.getElementById('properties-list');
    const uploadForm = document.getElementById('upload-form');
    const editPropertyForm = document.getElementById('editPropertyForm');

    if (window.location.pathname === '/upload') {
        await loadProperties();

        if (uploadForm) {
            uploadForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(uploadForm);
                const response = await fetch('/api/properties', {
                    method: 'POST',
                    body: formData,
                });
                if (response.ok) {
                    alert('Property uploaded successfully');
                    uploadForm.reset();
                    await loadProperties();
                } else {
                    alert('Error uploading property');
                }
            });
        }

        editPropertyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const propertyId = editPropertyForm.getAttribute('data-property-id');
            const formData = new FormData(editPropertyForm);
            const response = await fetch(`/api/properties/${propertyId}`, {
                method: 'PUT',
                body: formData,
            });
            if (response.ok) {
                alert('Property updated successfully');
                $('#editPropertyModal').modal('hide');
                await loadProperties();
            } else {
                alert('Error updating property');
            }
        });
    }

    async function loadProperties(localGovernment = '') {
        propertyList.innerHTML = ''; // Clear existing properties
        const response = await fetch(`/api/properties?localGovernment=${localGovernment}`);
        const properties = await response.json();

        if (properties.length === 0) {
            const message = document.createElement('p');
            message.textContent = 'No properties found.';
            propertyList.appendChild(message);
        } else {
            properties.forEach(property => {
                const propertyCard = document.createElement('div');
                propertyCard.className = 'col-md-4 mb-4';
                propertyCard.innerHTML = `
                   <div class="col-md-4 mb-4">
    <div class="card">
        <img class="card-img-top" src="/images/${property.image}" alt="${property.title}">
        <div class="card-body">
            <h5 class="card-title">${property.title}</h5>
            <p class="card-text"><strong>Location:</strong> ${property.location}</p>
            <p class="card-text"><strong>Local Government:</strong> ${property.localGovernment}</p>
            <p class="card-text">${property.description}</p>
            <button class="btn btn-secondary btn-more-options" data-property-id="${property._id}">More Options</button>
            <div class="dropdown-menu" id="dropdown-${property._id}">
                <button class="btn btn-warning btn-edit" data-property-id="${property._id}">Edit</button>
                <button class="btn btn-danger btn-delete" data-property-id="${property._id}">Delete</button>
            </div>
        </div>
    </div>
</div>

                `;
                propertyList.appendChild(propertyCard);
            });

            document.querySelectorAll('.btn-more-info').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const propertyId = btn.getAttribute('data-property-id');
                    const propertyResponse = await fetch(`/api/properties/${propertyId}`);
                    const propertyData = await propertyResponse.json();
                    populateModal(propertyData);
                });
            });

            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const propertyId = btn.getAttribute('data-property-id');
                    console.log(`Edit button clicked for property ID: ${propertyId}`); // Debugging log
                    await openEditModal(propertyId);
                });
            });

            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const propertyId = btn.getAttribute('data-property-id');
                    await deleteProperty(propertyId);
                });
            });
        }
    }

    function populateModal(property) {
        const modalBody = document.getElementById('propertyModalBody');
        modalBody.innerHTML = `
            <img class="img-fluid" src="/images/${property.image}" alt="Property image">
            <h3>${property.title}</h3>
            <p>${property.description}</p>
            <ul>
                <li>Location: ${property.location}</li>
                <li>Email: ${property.email}</li>
                <li>Phone: ${property.phone}</li>
                <li>Local Government: ${property.localGovernment}</li>
            </ul>
        `;
        $('#propertyModal').modal('show');
    }

    async function openEditModal(propertyId) {
        console.log(`Fetching property data for ID: ${propertyId}`); // Debugging log
        const propertyResponse = await fetch(`/api/properties/${propertyId}`);
        const propertyData = await propertyResponse.json();
        console.log('Fetched property data:', propertyData); // Debugging log

        const editForm = document.getElementById('editPropertyForm');
        editForm.querySelector('#edit-title').value = propertyData.title;
        editForm.querySelector('#edit-location').value = propertyData.location;
        editForm.querySelector('#edit-description').value = propertyData.description;
        editForm.querySelector('#edit-email').value = propertyData.email;
        editForm.querySelector('#edit-phone').value = propertyData.phone;
        editForm.querySelector('#edit-localGovernment').value = propertyData.localGovernment;
        editForm.setAttribute('data-property-id', propertyId);

        $('#editPropertyModal').modal('show');
    }

    async function deleteProperty(propertyId) {
        const response = await fetch(`/api/properties/${propertyId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            alert('Property deleted successfully');
            await loadProperties();
        } else {
            alert('Error deleting property');
        }
    }
});
