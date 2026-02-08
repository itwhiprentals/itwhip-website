// app/utils/email-validator.ts

export interface EmailValidationResult {
    isValid: boolean
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    riskScore: number // 0-100
    flags: string[]
    domain: string
    username: string
    suggestions?: string[] // For typo detection
  }
  
  // Known disposable email domains (partial list - expand as needed)
  const DISPOSABLE_DOMAINS = [
    // Popular temporary email services
    '10minutemail.com',
    '10minutemail.net',
    'guerrillamail.com',
    'guerrillamail.net',
    'guerrillamail.org',
    'guerrillamail.biz',
    'guerrillamail.de',
    'guerrillamailblock.com',
    'mailinator.com',
    'mailinator.net',
    'mailinator2.com',
    'tempmail.com',
    'temp-mail.org',
    'throwaway.email',
    'throwawaymail.com',
    'yopmail.com',
    'yopmail.fr',
    'yopmail.net',
    'trashmail.com',
    'trashmails.com',
    'mailnesia.com',
    'tempmailaddress.com',
    'tempinbox.com',
    'disposablemail.com',
    'temporarymail.net',
    'spamgourmet.com',
    'spamgourmet.net',
    'spam4.me',
    'dodgeit.com',
    'getairmail.com',
    'mail-temporaire.fr',
    'maildrop.cc',
    'harakirimail.com',
    'sharklasers.com',
    'guerrillamailblock.com',
    'pokemail.net',
    'tmail.com',
    'tmails.net',
    'tmpmail.org',
    'tmpmail.net',
    'moakt.com',
    'dispostable.com',
    'mailcatch.com',
    'mailnull.com',
    'tempail.com',
    'nominbox.com',
    'throwemail.com',
    'inboxalias.com',
    'anonymbox.com',
    'notmailinator.com',
    'incognitomail.org',
    'mailinator.org',
    'binkmail.com',
    'bobmail.info',
    'chammy.info',
    'devnullmail.com',
    'letthemeatspam.com',
    'no-spam.ws',
    'objectmail.com',
    'proxymail.eu',
    'rcpt.at',
    'trash-mail.at',
    'spamavert.com',
    'mytrashmail.com',
    'mailexpire.com',
    'mailforspam.com',
    'sharklasers.com',
    'spam.la',
    'cosmorph.com',
    'mintemail.com',
    'tempsky.com'
  ]
  
  // Common email domains for typo detection
  const COMMON_DOMAINS = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'aol.com',
    'msn.com',
    'live.com',
    'ymail.com',
    'protonmail.com',
    'zoho.com',
    'mail.com'
  ]
  
  // High-risk TLDs often used for fraud
  const HIGH_RISK_TLDS = [
    '.tk',
    '.ml',
    '.ga',
    '.cf',
    '.click',
    '.download',
    '.review',
    '.top',
    '.win',
    '.bid',
    '.date',
    '.faith',
    '.loan',
    '.accountant',
    '.cricket',
    '.science',
    '.work'
  ]
  
  // Suspicious patterns in email usernames
  const SUSPICIOUS_PATTERNS = [
    /^[0-9]{8,}@/, // Starts with 8+ digits
    /^test/i, // Starts with "test"
    /^temp/i, // Starts with "temp"
    /^fake/i, // Starts with "fake"
    /^spam/i, // Starts with "spam"
    /^noreply/i, // Starts with "noreply"
    /^donotreply/i, // Starts with "donotreply"
    /[0-9]{6,}/, // Contains 6+ consecutive digits
    /^[a-z]{1,2}[0-9]{6,}@/i, // 1-2 letters followed by 6+ digits
    /^user[0-9]+@/i, // user123 pattern
    /^customer[0-9]+@/i, // customer123 pattern
    /^client[0-9]+@/i, // client123 pattern
    /\+.+@/, // Contains + (alias)
    /\.{2,}/, // Multiple consecutive dots
    /[^a-zA-Z0-9.+_-]/, // Contains invalid characters
  ]
  
  /**
   * Basic email format validation
   */
  function isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }
  
  /**
   * Check if domain is disposable/temporary
   */
  function isDisposableDomain(domain: string): boolean {
    const lowerDomain = domain.toLowerCase()
    return DISPOSABLE_DOMAINS.some(disposable => 
      lowerDomain === disposable || lowerDomain.endsWith(`.${disposable}`)
    )
  }
  
  /**
   * Check if TLD is high-risk
   */
  function hasHighRiskTLD(domain: string): boolean {
    const lowerDomain = domain.toLowerCase()
    return HIGH_RISK_TLDS.some(tld => lowerDomain.endsWith(tld))
  }
  
  /**
   * Check for suspicious patterns in username
   */
  function hasSuspiciousUsername(username: string): string[] {
    const flags: string[] = []
    
    SUSPICIOUS_PATTERNS.forEach((pattern, index) => {
      if (pattern.test(username)) {
        switch(index) {
          case 0: flags.push('excessive_digits_start'); break
          case 1: flags.push('test_email'); break
          case 2: flags.push('temp_email'); break
          case 3: flags.push('fake_email'); break
          case 4: flags.push('spam_email'); break
          case 5: case 6: flags.push('noreply_email'); break
          case 7: flags.push('excessive_digits'); break
          case 8: flags.push('bot_pattern'); break
          case 9: case 10: case 11: flags.push('generic_username'); break
          case 12: flags.push('email_alias'); break
          case 13: flags.push('invalid_dots'); break
          case 14: flags.push('invalid_characters'); break
        }
      }
    })
    
    return flags
  }
  
  /**
   * Detect possible typos in common domains
   */
  function detectTypos(domain: string): string[] {
    const suggestions: string[] = []
    const lowerDomain = domain.toLowerCase()
    
    // Common typos
    const typoMap: { [key: string]: string } = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmil.com': 'gmail.com',
      'gmail.co': 'gmail.com',
      'gmail.om': 'gmail.com',
      'gmaill.com': 'gmail.com',
      'gnail.com': 'gmail.com',
      'gmsil.com': 'gmail.com',
      'yahho.com': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'yahooo.com': 'yahoo.com',
      'yahoo.co': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'hotmai.com': 'hotmail.com',
      'hotmil.com': 'hotmail.com',
      'hotmal.com': 'hotmail.com',
      'hotmali.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
      'outloo.com': 'outlook.com',
      'iclod.com': 'icloud.com',
      'icloud.co': 'icloud.com'
    }
    
    if (typoMap[lowerDomain]) {
      suggestions.push(typoMap[lowerDomain])
    }
    
    // Check for missing letters in common domains
    COMMON_DOMAINS.forEach(commonDomain => {
      if (levenshteinDistance(lowerDomain, commonDomain) === 1) {
        suggestions.push(commonDomain)
      }
    })
    
    return suggestions
  }
  
  /**
   * Calculate Levenshtein distance between two strings
   */
  function levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }
  
  /**
   * Calculate risk score based on various factors
   */
  function calculateRiskScore(flags: string[]): number {
    let score = 0
    
    // Critical risk factors
    if (flags.includes('disposable_domain')) score += 40
    if (flags.includes('invalid_format')) score += 50
    
    // High risk factors
    if (flags.includes('high_risk_tld')) score += 30
    if (flags.includes('fake_email')) score += 35
    if (flags.includes('test_email')) score += 35
    if (flags.includes('temp_email')) score += 35
    
    // Medium risk factors
    if (flags.includes('excessive_digits')) score += 20
    if (flags.includes('excessive_digits_start')) score += 25
    if (flags.includes('bot_pattern')) score += 25
    if (flags.includes('generic_username')) score += 15
    if (flags.includes('spam_email')) score += 20
    if (flags.includes('noreply_email')) score += 15
    
    // Low risk factors
    if (flags.includes('email_alias')) score += 10
    if (flags.includes('invalid_dots')) score += 15
    if (flags.includes('invalid_characters')) score += 20
    if (flags.includes('subdomain_email')) score += 5
    if (flags.includes('new_domain')) score += 10
    
    return Math.min(100, score)
  }
  
  /**
   * Main email validation function
   */
  export function validateEmail(email: string): EmailValidationResult {
    const flags: string[] = []
    
    // Trim and lowercase
    email = email.trim().toLowerCase()
    
    // Check basic format
    if (!isValidEmailFormat(email)) {
      flags.push('invalid_format')
      return {
        isValid: false,
        riskLevel: 'critical',
        riskScore: 100,
        flags,
        domain: '',
        username: email
      }
    }
    
    // Split email into parts
    const [username, domain] = email.split('@')
    
    // Check for disposable domain
    if (isDisposableDomain(domain)) {
      flags.push('disposable_domain')
    }
    
    // Check for high-risk TLD
    if (hasHighRiskTLD(domain)) {
      flags.push('high_risk_tld')
    }
    
    // Check for suspicious username patterns
    const usernameFlags = hasSuspiciousUsername(username)
    flags.push(...usernameFlags)
    
    // Check for subdomain (e.g., user@mail.company.com)
    if (domain.split('.').length > 2 && !domain.includes('.co.')) {
      flags.push('subdomain_email')
    }
    
    // Check for very short username (less than 3 chars)
    if (username.length < 3) {
      flags.push('short_username')
    }
    
    // Check for very long username (more than 64 chars)
    if (username.length > 64) {
      flags.push('long_username')
    }
    
    // Detect possible typos
    const suggestions = detectTypos(domain)
    
    // Calculate risk score
    const riskScore = calculateRiskScore(flags)
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical'
    if (riskScore >= 70) riskLevel = 'critical'
    else if (riskScore >= 50) riskLevel = 'high'
    else if (riskScore >= 30) riskLevel = 'medium'
    else riskLevel = 'low'
    
    return {
      isValid: true,
      riskLevel,
      riskScore,
      flags,
      domain,
      username,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    }
  }
  
  /**
   * Bulk validate multiple emails (for pattern detection)
   */
  export function validateEmailBatch(emails: string[]): {
    results: EmailValidationResult[]
    patterns: string[]
  } {
    const results = emails.map(email => validateEmail(email))
    const patterns: string[] = []
    
    // Check for same domain used multiple times
    const domainCounts: { [key: string]: number } = {}
    results.forEach(result => {
      if (result.domain) {
        domainCounts[result.domain] = (domainCounts[result.domain] || 0) + 1
      }
    })
    
    Object.entries(domainCounts).forEach(([domain, count]) => {
      if (count > 3) {
        patterns.push(`multiple_same_domain:${domain}`)
      }
    })
    
    // Check for sequential patterns
    const usernames = results.map(r => r.username).sort()
    for (let i = 1; i < usernames.length; i++) {
      if (usernames[i].startsWith(usernames[i-1].slice(0, -1))) {
        patterns.push('sequential_usernames')
        break
      }
    }
    
    // Check if all emails are high risk
    if (results.every(r => r.riskLevel === 'high' || r.riskLevel === 'critical')) {
      patterns.push('all_high_risk')
    }
    
    return { results, patterns }
  }
  
  /**
   * Check if email domain exists (requires external API in production)
   */
  export async function checkDomainExists(domain: string): Promise<boolean> {
    // This is a placeholder - in production, you'd use DNS lookup or an API
    // For now, return true for known good domains, false for obviously bad ones
    
    const knownGoodDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'icloud.com', 'aol.com', 'protonmail.com', 'mail.com'
    ]
    
    if (knownGoodDomains.includes(domain.toLowerCase())) {
      return true
    }
    
    // Check if domain has proper format
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
      return false
    }
    
    // In production, you would:
    // 1. Use DNS.resolveMx() in Node.js to check MX records
    // 2. Or use a service like Kickbox, NeverBounce, or EmailListVerify
    
    return true // Default to true for now
  }