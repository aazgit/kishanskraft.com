# 🚀 GitHub Actions CI/CD Setup

This directory contains automated workflows for the KishansKraft website deployment and monitoring.

## 📋 Available Workflows

### 1. 🏗️ Build and Deploy (`build-and-deploy.yml`)
**Triggers:** Push to main/develop, Pull Requests
**Features:**
- ✅ Multi-version Node.js testing (18, 20)
- ✅ Security audit
- ✅ Production build generation
- ✅ Build artifact validation
- ✅ Bundle size analysis
- ✅ Preview deployment for PRs
- ✅ Production deployment on main push
- ✅ Lighthouse performance audit

### 2. 📊 Performance Monitoring (`monitoring.yml`)
**Triggers:** Daily at 2 AM UTC, Manual dispatch
**Features:**
- ✅ Daily Lighthouse performance audits
- ✅ Security vulnerability scanning
- ✅ Website uptime monitoring
- ✅ SEO health checks
- ✅ Dependency review

### 3. 🔄 Auto-Deploy to Plesk (`auto-deploy-plesk.yml`)
**Triggers:** Push to main (excluding docs)
**Features:**
- ✅ Automated SSH deployment to Plesk hosting
- ✅ Backup creation before deployment
- ✅ Git-based deployment with rollback capability
- ✅ Automatic permissions setting
- ✅ Deployment verification
- ✅ Success notifications

## 🔧 Setup Requirements

### GitHub Repository Secrets

For full functionality, add these secrets in GitHub Settings > Secrets and Variables > Actions:

#### Production Deployment
```bash
# General deployment (for build-and-deploy.yml)
DEPLOY_HOST=your-server.com
DEPLOY_USER=your-username
DEPLOY_KEY=-----BEGIN OPENSSH PRIVATE KEY-----...
DEPLOY_PATH=/path/to/web/directory

# Plesk-specific (for auto-deploy-plesk.yml)
PLESK_HOST=your-plesk-server.com
PLESK_USER=your-plesk-username
PLESK_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----...
PLESK_PORT=22
PLESK_WEB_DIR=httpdocs
```

### SSH Key Setup

1. **Generate SSH key pair:**
   ```bash
   ssh-keygen -t rsa -b 4096 -C "github-actions@kishans-kraft.com"
   ```

2. **Add public key to server:**
   ```bash
   # Copy public key to server's authorized_keys
   cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
   ```

3. **Add private key to GitHub Secrets:**
   - Copy the entire private key content
   - Add as `DEPLOY_KEY` or `PLESK_SSH_KEY` secret

## 🌐 Deployment Environments

### Development
- **Trigger:** Pull Requests
- **Environment:** Preview deployment
- **URL:** `https://preview-{pr-number}.kishans-kraft.dev`

### Production
- **Trigger:** Push to main branch
- **Environment:** Live production site
- **URL:** `https://kishans-kraft.com`

## 📊 Monitoring & Quality Gates

### Performance Thresholds
- **Performance Score:** ≥90%
- **Accessibility:** ≥95%
- **Best Practices:** ≥85%
- **SEO:** ≥90%
- **PWA:** ≥80%

### Security Checks
- ✅ npm audit (high vulnerabilities)
- ✅ Dependency vulnerability review
- ✅ Security header validation
- ✅ SSL certificate verification

## 🚀 Usage

### Automatic Deployment
Just push to main branch:
```bash
git add .
git commit -m "✨ Add new feature"
git push origin main
```

### Manual Deployment
Trigger workflows manually:
1. Go to Actions tab in GitHub
2. Select desired workflow
3. Click "Run workflow"

### Pull Request Preview
Create a PR to get automatic preview deployment:
```bash
git checkout -b feature/new-feature
git push origin feature/new-feature
# Create PR on GitHub
```

## 🔍 Monitoring

### Daily Health Checks
- 🔍 Performance audits
- 🛡️ Security scans
- ⏰ Uptime monitoring
- 🔍 SEO validation

### Real-time Alerts
- ❌ Build failures
- ⚡ Performance degradation
- 🛡️ Security vulnerabilities
- 🌐 Site downtime

## 📝 Workflow Customization

### Update Domain URLs
Replace placeholder domains in workflow files:
```yaml
# Change this:
url: https://your-domain.com

# To your actual domain:
url: https://kishans-kraft.com
```

### Modify Performance Thresholds
Edit `lighthouserc.json`:
```json
{
  "assert": {
    "assertions": {
      "categories:performance": ["warn", {"minScore": 0.9}]
    }
  }
}
```

### Custom Deployment Steps
Add custom steps to workflow files:
```yaml
- name: 🎯 Custom Step
  run: |
    echo "Add your custom deployment logic here"
```

## 🛠️ Troubleshooting

### Common Issues

**Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies are properly listed
- Review build logs in Actions tab

**Deployment Failures:**
- Verify SSH key permissions (600)
- Check server connectivity
- Validate file paths and permissions

**Performance Issues:**
- Review Lighthouse reports
- Check bundle size analysis
- Optimize images and assets

### Debug Mode
Add debug output to workflows:
```yaml
- name: 🐛 Debug Info
  run: |
    echo "Node version: $(node --version)"
    echo "npm version: $(npm --version)"
    ls -la
```

## 🎯 Benefits

✅ **Zero-downtime deployments** with automatic rollback
✅ **Quality assurance** with automated testing
✅ **Performance monitoring** with Lighthouse audits
✅ **Security scanning** with vulnerability checks
✅ **Preview environments** for safe testing
✅ **Automated backups** before deployments
✅ **Real-time notifications** on deployment status

---

**Ready to deploy?** Push your changes and watch the magic happen! 🚀