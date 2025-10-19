// app/lib/email/templates/host-background-check-status.ts

import { EmailTemplate } from '../types'

export interface BackgroundCheckDetail {
  checkType: string
  status: 'pending' | 'passed' | 'failed' | 'review'
  message?: string
}

export interface HostBackgroundCheckData {
  hostName: string
  checkStatus: 'started' | 'completed' | 'failed' | 'action_required'
  checks: BackgroundCheckDetail[]
  nextSteps?: string
  actionUrl?: string
  estimatedCompletion?: string
  supportEmail?: string
}

export function getHostBackgroundCheckStatusTemplate(data: HostBackgroundCheckData): EmailTemplate {
  const subjectMap = {
    started: 'Background Check Started - ItWhip Host Application',
    completed: 'Background Check Complete - Welcome to ItWhip!',
    failed: 'Background Check Update - Additional Information Needed',
    action_required: 'Action Required - Background Check Process'
  }
  
  const subject = subjectMap[data.checkStatus]
  
  const statusColors = {
    started: '#3b82f6',      // Blue
    completed: '#10b981',    // Green
    failed: '#ef4444',       // Red
    action_required: '#f59e0b' // Orange
  }
  
  const statusIcons = {
    started: '🔍',
    completed: '✅',
    failed: '❌',
    action_required: '⚠️'
  }
  
  const statusMessages = {
    started: 'We\'ve started verifying your information',
    completed: 'All checks have been successfully completed',
    failed: 'We encountered some issues during verification',
    action_required: 'Your verification needs attention'
  }
  
  const getCheckStatusIcon = (status: string) => {
    switch(status) {
      case 'passed': return '✅'
      case 'failed': return '❌'
      case 'review': return '🔍'
      default: return '⏳'
    }
  }
  
  const getCheckStatusColor = (status: string) => {
    switch(status) {
      case 'passed': return '#10b981'
      case 'failed': return '#ef4444'
      case 'review': return '#f59e0b'
      default: return '#6b7280'
    }
  }
  
  const checksHtml = data.checks.map(check => `
    <div style="background: #f9fafb; border-left: 4px solid ${getCheckStatusColor(check.status)}; padding: 12px 16px; margin-bottom: 12px; border-radius: 4px;">
      <div style="display: flex; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 18px; margin-right: 8px;">${getCheckStatusIcon(check.status)}</span>
        <strong style="font-size: 14px; color: #111827;">${check.checkType}</strong>
      </div>
      ${check.message ? `<p style="margin: 0; font-size: 13px; color: #6b7280;">${check.message}</p>` : ''}
    </div>
  `).join('')
  
  const checksText = data.checks.map(check => 
    `${getCheckStatusIcon(check.status)} ${check.checkType}${check.message ? ': ' + check.message : ''}`
  ).join('\n')
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
            line-height: 1.6; 
            color: #111827; 
            background: #ffffff;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border: 1px solid #e5e7eb;
          }
          .header { 
            background: linear-gradient(135deg, ${statusColors[data.checkStatus]} 0%, ${statusColors[data.checkStatus]}dd 100%); 
            color: white; 
            padding: 40px 20px;
            text-align: center; 
          }
          .status-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 1px;
            margin-bottom: 16px;
            text-transform: uppercase;
          }
          .header h1 {
            font-size: 28px;
            font-weight: 400;
            margin: 0 0 8px 0;
          }
          .header p {
            font-size: 14px;
            margin: 0;
            opacity: 0.9;
          }
          .content { 
            padding: 30px 20px;
          }
          .status-summary {
            background: ${data.checkStatus === 'completed' ? '#dcfce7' : data.checkStatus === 'failed' ? '#fee2e2' : '#fef3c7'};
            border: 1px solid ${data.checkStatus === 'completed' ? '#86efac' : data.checkStatus === 'failed' ? '#fca5a5' : '#fde68a'};
            padding: 20px;
            margin: 24px 0;
            border-radius: 8px;
            text-align: center;
          }
          .status-icon {
            font-size: 48px;
            margin-bottom: 8px;
          }
          .status-text {
            font-size: 16px;
            font-weight: 600;
            color: ${data.checkStatus === 'completed' ? '#166534' : data.checkStatus === 'failed' ? '#991b1b' : '#92400e'};
          }
          .checks-container {
            margin: 32px 0;
          }
          .checks-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #111827;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: ${statusColors[data.checkStatus]};
            color: white;
            text-decoration: none;
            font-weight: 500;
            border-radius: 6px;
            margin: 24px 0;
            text-align: center;
          }
          .info-box {
            background: #eff6ff;
            border: 1px solid #60a5fa;
            padding: 16px;
            margin: 24px 0;
            border-radius: 6px;
            font-size: 14px;
            color: #1e40af;
          }
          .timeline-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 20px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .timeline-box h3 {
            font-size: 16px;
            margin: 0 0 12px 0;
            color: #111827;
          }
          .timeline-box ul {
            margin: 0 0 0 20px;
            padding: 0;
            font-size: 14px;
            color: #4b5563;
          }
          .timeline-box li {
            margin: 8px 0;
          }
          .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
          .footer a {
            color: ${statusColors[data.checkStatus]};
            text-decoration: none;
          }
          @media only screen and (max-width: 600px) {
            .header { padding: 30px 16px; }
            .header h1 { font-size: 24px; }
            .content { padding: 20px 16px; }
            .status-icon { font-size: 36px; }
            .button { display: block; text-align: center; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="status-badge">Background Check Update</div>
            <h1>${statusIcons[data.checkStatus]} Background Check ${data.checkStatus === 'started' ? 'In Progress' : data.checkStatus === 'completed' ? 'Complete' : data.checkStatus === 'failed' ? 'Review Needed' : 'Action Required'}</h1>
            <p>${statusMessages[data.checkStatus]}</p>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Hi ${data.hostName},</p>
            
            ${data.checkStatus === 'started' ? `
              <p style="color: #4b5563; margin-bottom: 24px;">
                Good news! We've initiated your background verification process. This is an important step 
                in becoming a trusted host on the ItWhip platform. The process typically takes 2-3 business days.
              </p>
            ` : data.checkStatus === 'completed' ? `
              <p style="color: #4b5563; margin-bottom: 24px;">
                Congratulations! Your background verification has been successfully completed. 
                You're now approved to start listing and hosting vehicles on ItWhip!
              </p>
            ` : data.checkStatus === 'failed' ? `
              <p style="color: #4b5563; margin-bottom: 24px;">
                We've completed your background verification but found some items that need your attention 
                before we can approve your host application. Don't worry - many of these issues can be resolved quickly.
              </p>
            ` : `
              <p style="color: #4b5563; margin-bottom: 24px;">
                Your background verification requires some additional information or action from you. 
                Please review the details below and take the necessary steps.
              </p>
            `}
            
            <div class="status-summary">
              <div class="status-icon">${statusIcons[data.checkStatus]}</div>
              <div class="status-text">
                ${data.checkStatus === 'started' ? 'Verification In Progress' : 
                  data.checkStatus === 'completed' ? 'All Checks Passed!' : 
                  data.checkStatus === 'failed' ? 'Review Required' : 
                  'Action Needed'}
              </div>
              ${data.estimatedCompletion ? `
                <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">
                  Estimated completion: ${data.estimatedCompletion}
                </p>
              ` : ''}
            </div>
            
            <div class="checks-container">
              <h2 class="checks-title">Verification Status:</h2>
              ${checksHtml}
            </div>
            
            ${data.nextSteps ? `
              <div class="info-box">
                <strong>📋 Next Steps:</strong><br>
                ${data.nextSteps}
              </div>
            ` : ''}
            
            ${data.actionUrl ? `
              <div style="text-align: center; margin: 32px 0;">
                <a href="${data.actionUrl}" class="button">
                  ${data.checkStatus === 'completed' ? 'Go to Host Dashboard' : 
                    data.checkStatus === 'failed' ? 'Review & Respond' : 
                    data.checkStatus === 'action_required' ? 'Take Action Now' : 
                    'Check Status'}
                </a>
              </div>
            ` : ''}
            
            ${data.checkStatus === 'started' ? `
              <div class="timeline-box">
                <h3>What's being verified?</h3>
                <ul>
                  <li>Identity verification</li>
                  <li>Driving record (DMV check)</li>
                  <li>Criminal background check</li>
                  <li>Insurance verification</li>
                </ul>
              </div>
            ` : data.checkStatus === 'completed' ? `
              <div class="timeline-box">
                <h3>🎉 You're ready to start hosting!</h3>
                <ul>
                  <li>Add your first vehicle</li>
                  <li>Set your availability and pricing</li>
                  <li>Review our host guidelines</li>
                  <li>Start earning with ItWhip</li>
                </ul>
              </div>
            ` : ''}
            
            <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 32px;">
              Questions about the background check process?<br>
              Contact our host support team at<br>
              <a href="mailto:${data.supportEmail || 'hosts@itwhip.com'}" style="color: ${statusColors[data.checkStatus]};">
                ${data.supportEmail || 'hosts@itwhip.com'}
              </a>
            </p>
          </div>
          
          <div class="footer">
            <strong>ITWHIP HOST PORTAL</strong><br>
            Building Trust in Vehicle Sharing<br>
            <a href="https://itwhip.com/host/help">Host Help Center</a> | 
            <a href="https://itwhip.com/host/terms">Host Terms</a> |
            <a href="https://itwhip.com/privacy">Privacy Policy</a><br>
            <span style="font-size: 11px; margin-top: 8px; display: block;">
              © 2025 ItWhip Technologies. All rights reserved.<br>
              Background checks are conducted by certified third-party providers.
            </span>
          </div>
        </div>
      </body>
    </html>
  `
  
  const text = `
${subject}

Hi ${data.hostName},

${statusMessages[data.checkStatus]}

${data.checkStatus === 'started' ? 
  'Good news! We\'ve initiated your background verification process. This typically takes 2-3 business days.' : 
  data.checkStatus === 'completed' ? 
  'Congratulations! Your background verification has been successfully completed. You\'re now approved to start listing vehicles on ItWhip!' : 
  data.checkStatus === 'failed' ? 
  'We\'ve completed your background verification but found some items that need your attention.' : 
  'Your background verification requires some additional information or action from you.'}

Verification Status:
${checksText}

${data.estimatedCompletion ? `Estimated completion: ${data.estimatedCompletion}` : ''}

${data.nextSteps ? `Next Steps: ${data.nextSteps}` : ''}

${data.actionUrl ? `Take action: ${data.actionUrl}` : ''}

${data.checkStatus === 'started' ? `
What's being verified?
- Identity verification
- Driving record (DMV check)
- Criminal background check
- Insurance verification
` : data.checkStatus === 'completed' ? `
You're ready to start hosting!
- Add your first vehicle
- Set your availability and pricing
- Review our host guidelines
- Start earning with ItWhip
` : ''}

Questions? Contact our host support team at ${data.supportEmail || 'hosts@itwhip.com'}

ITWHIP HOST PORTAL
Building Trust in Vehicle Sharing
© 2025 ItWhip Technologies. All rights reserved.
  `
  
  return { subject, html, text }
}