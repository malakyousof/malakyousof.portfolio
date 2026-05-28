async function init() {
    const { data: { session } } = await db.auth.getSession();
    if (session) showPanel();
    else document.getElementById('login-form').style.display = 'block';
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) document.getElementById('login-error').textContent = error.message;
    else showPanel();
}

async function logout() {
    await db.auth.signOut();
    location.reload();
}

function showPanel() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    loadExisting();
}

async function uploadFile(file, folder) {
    if (!file) return null;
    const path = `${folder}/${Date.now()}_${file.name}`;
    const { error } = await db.storage.from('portfolio-files').upload(path, file);
    if (error) { alert('Upload failed: ' + error.message); return null; }
    const { data } = db.storage.from('portfolio-files').getPublicUrl(path);
    return data.publicUrl;
}

async function addProject() {
    const status = document.getElementById('status');
    status.textContent = 'Uploading...';

    const coverUrl = await uploadFile(document.getElementById('cover-file').files[0], 'covers');
    const pdfUrl   = await uploadFile(document.getElementById('pdf-file').files[0], 'pdfs');

    const tags = document.getElementById('tags').value
        .split(',').map(t => t.trim()).filter(Boolean);

    const { error } = await db.from('projects').insert({
        title:       document.getElementById('title').value,
        description: document.getElementById('desc').value,
        github_link: document.getElementById('github').value || null,
        tags,
        cover_url:   coverUrl,
        pdf_url:     pdfUrl,
    });

    if (error) { status.textContent = 'Error: ' + error.message; return; }
    status.textContent = '✓ Project added!';
    loadExisting();
}

async function deleteProject(id) {
    if (!confirm('Delete this project?')) return;
    await db.from('projects').delete().eq('id', id);
    loadExisting();
}

async function loadExisting() {
    const { data } = await db.from('projects').select('*').order('created_at', { ascending: false });
    const container = document.getElementById('existing-projects');
    container.innerHTML = data.map(p => `
    <div class="project-row">
      <strong>${p.title}</strong><br/>
      <small>${(p.tags ?? []).join(', ')}</small><br/>
      ${p.pdf_url    ? `<a href="${p.pdf_url}"    target="_blank">PDF</a> · ` : ''}
      ${p.github_link ? `<a href="${p.github_link}" target="_blank">GitHub</a>` : ''}
      <button onclick="deleteProject('${p.id}')" style="float:right;color:red">Delete</button>
    </div>
  `).join('');
}

init();