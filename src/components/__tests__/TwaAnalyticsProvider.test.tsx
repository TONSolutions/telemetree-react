// @ts-nocheck
import '@testing-library/jest-dom';
import React from 'react';
import { render, act } from '@testing-library/react';
import TwaAnalyticsProvider from '../TwaAnalyticsProvider';
import { EventBuilder } from '../../builders';
import { getConfig } from '../../config';

// Mock dependencies
jest.mock('../../builders');
jest.mock('../../telegram/telegram', () => ({
  loadTelegramWebAppData: jest.fn(),
}));
jest.mock('../../config');

const { loadTelegramWebAppData } = jest.requireMock('../../telegram/telegram');

describe('TwaAnalyticsProvider', () => {
  const mockProjectId = 'test-project-id';
  const mockApiKey = 'test-api-key';
  const mockAppName = 'test-app-name';

  beforeEach(() => {
    jest.clearAllMocks();
    loadTelegramWebAppData.mockReturnValue({
      auth_date: 1234567890,
      hash: 'mockedHash',
      platform: 'tdesktop',
    });
    (getConfig as jest.Mock).mockReturnValue({
      defaultSystemEventPrefix: '[TS]',
    });
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <TwaAnalyticsProvider
        projectId={mockProjectId}
        apiKey={mockApiKey}
        appName={mockAppName}
      >
        <div>Test Child</div>
      </TwaAnalyticsProvider>,
    );

    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('throws error when projectId is missing', () => {
    console.error = jest.fn(); // Suppress console.error for this test
    expect(() =>
      render(
        // @ts-ignore
        <TwaAnalyticsProvider apiKey={mockApiKey} appName={mockAppName}>
          <div>Test Child</div>
        </TwaAnalyticsProvider>,
      ),
    ).toThrow('TWA Analytics Provider: Missing projectId');
  });

  it('initializes EventBuilder with correct parameters', () => {
    render(
      <TwaAnalyticsProvider
        projectId={mockProjectId}
        apiKey={mockApiKey}
        appName={mockAppName}
      >
        <div>Test Child</div>
      </TwaAnalyticsProvider>,
    );

    expect(EventBuilder).toHaveBeenCalledWith(
      mockProjectId,
      mockApiKey,
      mockAppName,
      expect.any(Object),
    );
  });
});

