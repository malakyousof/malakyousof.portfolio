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
        : data.map(p => `
      <div class="project-card fade-in">
        <div class="project-thumb" style="background: linear-gradient(135deg, #4a1040 0%, #c4166f 100%);">
          ${p.cover_url
            ? `<img src="${p.cover_url}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;" />`
            : `<div class="project-thumb-label">${p.title}</div>`
        }
          ${p.pdf_url
            ? `<div class="project-overlay"><a href="${p.pdf_url}" target="_blank">📄 View Report</a></div>`
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
            ${p.github_link
            ? `<a href="${p.github_link}" target="_blank" class="proj-link github">📁 GitHub</a>`
            : ''
        }
            ${p.pdf_url
            ? `<a href="${p.pdf_url}" target="_blank" class="proj-link colab">📄 Report</a>`
            : ''
        }
          </div>
        </div>
      </div>
    `).join('');

    // re-trigger fade-in observer for new cards
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    const numEl = document.querySelector('.stat-box .num');
    if (numEl) numEl.textContent = data.length + '+';
}


loadProjects();