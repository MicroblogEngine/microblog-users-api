import { describe, it, expect, vi, beforeEach } from 'vitest'
import sgMail from '@sendgrid/mail'
import Handlebars from 'handlebars'
import { promises as fs } from 'fs'
import sendMail from './mail'

// Mock dependencies
vi.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn()
  }
}))

vi.mock('handlebars', () => ({
  default: {
    compile: vi.fn()
  }
}))

vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn()
  }
}))

describe('sendMail', () => {
  const mockTemplate = '<h1>Hello {{name}}</h1>'
  const mockCompiledHtml = '<h1>Hello John</h1>'
  const mockTemplateFunction = vi.fn().mockReturnValue(mockCompiledHtml)

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    
    // Setup environment variable
    process.env.SENDGRID_API_KEY = 'test-api-key'
    
    // Setup mock returns
    vi.mocked(fs.readFile).mockResolvedValue(mockTemplate)
    vi.mocked(Handlebars.compile).mockReturnValue(mockTemplateFunction)
  })

  it('should send an email successfully', async () => {
    const emailData = {
      to: 'test@example.com',
      subject: 'Test Email',
      content: { name: 'John' },
      htmlTemplate: '/templates/email.html'
    }

    await sendMail(
      emailData.to,
      emailData.subject,
      emailData.content,
      emailData.htmlTemplate
    )

    // Verify API key was set
    expect(sgMail.setApiKey).toHaveBeenCalledWith('test-api-key')

    // Verify template was read
    expect(fs.readFile).toHaveBeenCalledWith(
      expect.stringContaining(emailData.htmlTemplate),
      'utf8'
    )

    // Verify template was compiled
    expect(Handlebars.compile).toHaveBeenCalledWith(mockTemplate)
    expect(mockTemplateFunction).toHaveBeenCalledWith(emailData.content)

    // Verify email was sent with correct data
    expect(sgMail.send).toHaveBeenCalledWith({
      to: emailData.to,
      from: 'rogerio.araujo@gmail.com',
      subject: emailData.subject,
      html: mockCompiledHtml
    })
  })

  it('should throw error when SENDGRID_API_KEY is not set', async () => {
    // Remove API key from environment
    delete process.env.SENDGRID_API_KEY

    await expect(
      sendMail('test@example.com', 'Test', {}, '/template.html')
    ).rejects.toThrow('SENDGRID_API_KEY is not set')
  })

  it('should throw error when file reading fails', async () => {
    const fileError = new Error('File not found')
    vi.mocked(fs.readFile).mockRejectedValue(fileError)

    await expect(
      sendMail('test@example.com', 'Test', {}, '/template.html')
    ).rejects.toThrow(fileError)
  })

  it('should throw error when sending fails', async () => {
    const sendError = new Error('Failed to send email')
    vi.mocked(sgMail.send).mockRejectedValue(sendError)

    await expect(
      sendMail('test@example.com', 'Test', {}, '/template.html')
    ).rejects.toThrow(sendError)
  })
}) 