import React from "react";
import { ConfigProvider, theme } from "antd";
import viVN from "antd/locale/vi_VN";

// Professional dark theme configuration
const darkTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
        colorPrimary: '#EF4444',
        colorSuccess: '#10B981',
        colorWarning: '#F97316',
        colorError: '#EF4444',
        colorInfo: '#3B82F6',
        colorBgBase: '#0F172A',
        colorBgContainer: '#1E293B',
        colorBorder: 'rgba(203, 213, 225, 0.1)',
        colorText: '#F8FAFC',
        colorTextSecondary: '#CBD5E1',
        fontSize: 14,
        borderRadius: 8,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    components: {
        Button: {
            controlHeight: 44,
            fontSize: 15,
            fontWeight: 600,
            primaryShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
        },
        Card: {
            boxShadowTertiary: '0 4px 6px rgba(0, 0, 0, 0.4)',
            borderRadiusLG: 12,
        },
        Progress: {
            defaultColor: '#EF4444',
        },
        Statistic: {
            contentFontSize: 32,
            titleFontSize: 14,
        },
    },
};

export default function ThemeProvider({ children }) {
    return (
        <ConfigProvider theme={darkTheme} locale={viVN}>
            {children}
        </ConfigProvider>
    );
}
