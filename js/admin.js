let editingId = null;

async function init() {
    const { data: { session } } = await db.auth.getSession();
    if (session) showPanel();
    else document.getElementById('login-form').style.display = 'block';
}

async function login() {
    const email    = document.getElementById('email').value;
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

async function saveProject() {
    const status = document.getElementById('status');
    const title  = document.getElementById('title').value.trim();
    if (!title) { status.textContent = 'Title is required.'; return; }
    status.textContent = 'Saving...';

    const coverFile      = document.getElementById('cover-file').files[0];
    const pdfFile        = document.getElementById('pdf-file').files[0];
    const powerbiPdfFile = document.getElementById('powerbi-pdf-file').files[0];
    const powerbiImgFile = document.getElementById('powerbi-img-file').files[0];

    const coverUrl      = coverFile      ? await uploadFile(coverFile,      'covers')      : null;
    const pdfUrl        = pdfFile        ? await uploadFile(pdfFile,        'pdfs')        : null;
    const powerbiPdfUrl = powerbiPdfFile ? await uploadFile(powerbiPdfFile, 'powerbi-pdf') : null;
    const powerbiImgUrl = powerbiImgFile ? await uploadFile(powerbiImgFile, 'powerbi-img') : null;

    const tags = document.getElementById('tags').value
        .split(',').map(t => t.trim()).filter(Boolean);

    const payload = {
        title,
        description:  document.getElementById('desc').value    || null,
        github_link:  document.getElementById('github').value  || null,
        colab_link:   document.getElementById('colab').value   || null,
        powerbi_link: document.getElementById('powerbi').value || null,
        tags,
    };

    // only overwrite file fields if new files were uploaded
    if (coverUrl)      payload.cover_url      = coverUrl;
    if (pdfUrl)        payload.pdf_url        = pdfUrl;
    if (powerbiPdfUrl) payload.powerbi_pdf_url = powerbiPdfUrl;
    if (powerbiImgUrl) payload.powerbi_img_url = powerbiImgUrl;

    let error;
    if (editingId) {
        ({ error } = await db.from('projects').update(payload).eq('id', editingId));
    } else {
        ({ error } = await db.from('projects').insert(payload));
    }

    if (error) { status.textContent = 'Error: ' + error.message; return; }
    status.textContent = editingId ? '✓ Project updated!' : '✓ Project added!';
    cancelEdit();
    loadExisting();
}

function editProject(p) {
    editingId = p.id;
    document.getElementById('form-title').textContent   = 'Edit Project';
    document.getElementById('edit-id').value            = p.id;
    document.getElementById('title').value              = p.title        ?? '';
    document.getElementById('desc').value               = p.description  ?? '';
    document.getElementById('github').value             = p.github_link  ?? '';
    document.getElementById('colab').value              = p.colab_link   ?? '';
    document.getElementById('powerbi').value            = p.powerbi_link ?? '';
    document.getElementById('tags').value               = (p.tags ?? []).join(', ');

    // show current file URLs as hints
    document.getElementById('cover-current').textContent      = p.cover_url       ? '✓ Has cover image'       : '';
    document.getElementById('pdf-current').textContent        = p.pdf_url         ? '✓ Has PDF report'        : '';
    document.getElementById('powerbi-pdf-current').textContent = p.powerbi_pdf_url ? '✓ Has Power BI PDF'      : '';
    document.getElementById('powerbi-img-current').textContent = p.powerbi_img_url ? '✓ Has Power BI image'    : '';

    document.getElementById('cancel-btn').style.display = 'inline-block';
    document.getElementById('status').textContent = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
    editingId = null;
    document.getElementById('form-title').textContent   = 'Add Project';
    document.getElementById('edit-id').value            = '';
    ['title','desc','github','colab','powerbi','tags'].forEach(id => document.getElementById(id).value = '');
    ['cover-file','pdf-file','powerbi-pdf-file','powerbi-img-file'].forEach(id => document.getElementById(id).value = '');
    ['cover-current','pdf-current','powerbi-pdf-current','powerbi-img-current'].forEach(id => document.getElementById(id).textContent = '');
    document.getElementById('cancel-btn').style.display = 'none';
    document.getElementById('status').textContent = '';
}

async function deleteProject(id) {
    if (!confirm('Delete this project?')) return;
    await db.from('projects').delete().eq('id', id);
    loadExisting();
}

async function loadExisting() {
    const { data, error } = await db.from('projects').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); return; }
    const container = document.getElementById('existing-projects');
    container.innerHTML = data.length === 0
        ? '<p>No projects yet.</p>'
        : data.map(p => `
      <div class="project-row">
        <strong>${p.title}</strong><br/>
        <small style="color:#888">${(p.tags ?? []).join(', ')}</small><br/>
        <small>
          ${p.github_link   ? '✓ GitHub · '   : ''}
          ${p.colab_link    ? '✓ Colab · '    : ''}
          ${p.powerbi_link  ? '✓ PBI link · ' : ''}
          ${p.powerbi_pdf_url ? '✓ PBI PDF · ' : ''}
          ${p.powerbi_img_url ? '✓ PBI img · ' : ''}
          ${p.pdf_url       ? '✓ Report PDF'  : ''}
        </small>
        <div class="project-row-actions">
          <button onclick='editProject(${JSON.stringify(p)})'>✏️ Edit</button>
          <button class="danger" onclick="deleteProject('${p.id}')">🗑 Delete</button>
        </div>
      </div>
    `).join('');
}

init();