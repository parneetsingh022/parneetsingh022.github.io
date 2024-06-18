fetchRepositoriesWithInfo('parneetsingh022')
    .then(response => {
        console.log(response);
        const projects = document.getElementById('projects');
        for(let item of response){
            if(!item.display) continue;
            let technologies = '';
            if(item.technologies){
            for(let tech of item.technologies){
                technologies += `<span class="technology">${tech}</span>`;
            }
            }
            projects.innerHTML += `
            <div class="project-card">
            <div class="desktop-card-view">
                <a href="#" class="material-symbols-outlined">
                    expand_content
                </a>
            </div>
            <div class="card-body">
                <div class="card-header">
                <h5 class="card-title">${item.displayName}</h5>
                ${item.tag ? `<span class="tag">${item.tag}</span>` : ''}
                </div>
                

                <p class="card-text">${item.description}</p>
                ${!item.demo ? '<p class="card-text not-available">Live demo not available for this project.</p>' : ''}
                <div class="technologies">
                <p>Technologies used:</p>
                ${technologies}
                </div>
            </div>

            <div class="project_links">
                <span><a href="${item.repoLink}">Source Code</a></span>
                ${item.demo ? `<span><a href="${item.demo}">Live Demo</a></span>` : ''}
                ${item.model ? `<span><a href="${item.model}">Model</a></span>` : ''}
            </div>
            <div class="mobile-card-view"><a href="#">View</a></div>
            
            </div>
            `
        }
    });

// Function to fetch repositories and their project.json data
async function fetchRepositoriesWithInfo(username) {
    const repositoriesList = [];

    try {
        // Fetch repositories from GitHub
        const repositories = await fetchRepositories(username);

        // Fetch project.json for each repository
        for (const repo of repositories) {
            const jsonData = await fetchProjectJson(username, repo.name);
            if (jsonData) {
                repositoriesList.push({
                    display: jsonData.config.display || true,
                    name: repo.name,
                    displayName: jsonData.config.display_name || null,
                    technologies: jsonData.config.technologies || null,
                    description: jsonData.config.description || null,
                    priority: jsonData.config.priority || null,
                    tag: jsonData.config.tag || null,
                    demo: jsonData.config.demo || null,
                    model: jsonData.config.model || null,
                    repoLink: repo.html_url // Add repo link to the object
                });
            }
        }

        // Sort repositoriesList by priority: low < medium < high < impactful
        repositoriesList.sort((a, b) => {
            const priorityOrder = {
                'low': 0,
                'medium': 1,
                'high': 2,
                'impactful': 3
            };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        return repositoriesList;
    } catch (error) {
        console.error('Error fetching repositories:', error.message);
        throw new Error('Failed to fetch repositories and their information');
    }
}

// Function to fetch repositories from GitHub API
async function fetchRepositories(username) {
    const url = `https://api.github.com/users/${username}/repos`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch repositories: ${response.status}`);
    }
    return await response.json();
}

// Function to fetch project.json for a repository
async function fetchProjectJson(username, repoName) {
    const url = `https://raw.githubusercontent.com/${username}/${repoName}/main/project.json`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        //console.error(`Error fetching 'project.json' for ${repoName}:`, error.message);
        return null;
    }
}