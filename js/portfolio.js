const GRADIENTS = [
    'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
    'linear-gradient(135deg, #6a1b9a 0%, #9c4dcc 100%)',
    'linear-gradient(135deg, #00695c 0%, #26a69a 100%)',
    'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
    'linear-gradient(135deg, #b71c1c 0%, #ef5350 100%)',
    'linear-gradient(135deg, #4a1040 0%, #c4166f 100%)',
];

async function loadProjects() {
    const { data, error } = await db
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) { console.error(error); return; }

    const container = document.getElementById('projects-grid');
    if (!container) return;

    container.innerHTML = data.length === 0
        ? '<p style="color:var(--gray)">No projects yet.</p>'
        : data.map((p, i) => {
            const bg = p.cover_url
                ? ''
                : `background: ${GRADIENTS[i % GRADIENTS.length]};`;
            return `
          <div class="project-card fade-in">
            <div class="project-thumb" style="${bg}">
              ${p.cover_url
                ? `<img src="${p.cover_url}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;" />`
                : `<div class="project-thumb-label">${p.title}</div>`
            }
            ${(p.pdf_url || p.powerbi_link || p.powerbi_pdf_url || p.powerbi_img_url)
                ? `<div class="project-overlay">
      ${p.powerbi_link   ? `<a href="${p.powerbi_link}"    target="_blank">📊 View Dashboard</a>` : ''}
      ${p.powerbi_pdf_url ? `<a href="${p.powerbi_pdf_url}" target="_blank">📊 View Dashboard</a>` : ''}
      ${p.powerbi_img_url ? `<a href="${p.powerbi_img_url}" target="_blank">📊 View Dashboard</a>` : ''}
    </div>`
                : ''
            }
            </div>
            <div class="project-body">
              <div class="project-cat">${(p.tags ?? []).join(' · ')}</div>
              <div class="project-title">${p.title}</div>
              <p class="project-desc">${p.description ?? ''}</p>
              <div class="project-tags">
                ${(p.tags ?? []).map(t => `<span class="project-tag">${t}</span>`).join('')}
              </div>
              <div class="project-links">
                ${p.github_link  ? `<a href="${p.github_link}"  target="_blank" class="proj-link github">📁 GitHub</a>`    : ''}
                ${p.colab_link   ? `<a href="${p.colab_link}"   target="_blank" class="proj-link colab">🔗 Colab</a>`      : ''}
                ${p.powerbi_link ? `<a href="${p.powerbi_link}" target="_blank" class="proj-link powerbi">📊 Power BI</a>` : ''}
                ${p.pdf_url      ? `<a href="${p.pdf_url}"      target="_blank" class="proj-link report">📄 Report</a>`    : ''}
              </div>
            </div>
          </div>
        `;
        }).join('');

    // update hero counter
    const numEl = document.querySelector('.stat-box .num');
    if (numEl) numEl.textContent = data.length + '+';

    // re-trigger fade-in
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

loadProjects();