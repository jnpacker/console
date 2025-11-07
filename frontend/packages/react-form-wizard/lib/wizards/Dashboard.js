import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardBody, CardTitle, Page, PageSection, Stack, Text, Title } from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';
import { Masonry } from './common/Masonry';
export function DashboardCard(props) {
    const history = useHistory();
    return (_jsxs(Card, { onClick: () => history.push(props.route), isSelectable: true, isRounded: true, isLarge: true, isFlat: true, style: { transition: 'box-shadow 400ms' }, children: [_jsx(CardTitle, { children: props.title }), props.children && _jsx(CardBody, { children: props.children })] }));
}
export function DashboardPage(props) {
    return (_jsx(Page, { additionalGroupedContent: _jsx(PageSection, { variant: "light", children: _jsx(Stack, { hasGutter: true, children: _jsxs(Stack, { children: [_jsx(Title, { headingLevel: "h2", children: props.title }), props.description && _jsx(Text, { children: props.description })] }) }) }), groupProps: { stickyOnBreakpoint: { default: 'top' } }, children: _jsx(PageSection, { isWidthLimited: true, variant: "light", children: _jsx(Masonry, { size: 300, children: props.children }) }) }));
}
//# sourceMappingURL=Dashboard.js.map