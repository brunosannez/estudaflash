
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home, ChevronRight } from 'lucide-react';

const AppBreadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);

    const breadcrumbMap: Record<string, { label: string; emoji: string }> = {
      '': { label: 'Dashboard', emoji: '🏠' },
      'upload': { label: 'Upload', emoji: '📤' },
      'meus-resumos': { label: 'Meus Resumos', emoji: '📚' },
      'meus-flashcards': { label: 'Flashcards', emoji: '🧠' },
      'historico-quiz': { label: 'Quiz', emoji: '🎯' },
      'progresso': { label: 'Progresso', emoji: '🏆' },
      'admin': { label: 'Admin Panel', emoji: '⚡' },
      'analytics': { label: 'Analytics', emoji: '📊' },
      'resumo': { label: 'Resumo', emoji: '📄' },
      'quiz': { label: 'Quiz', emoji: '🎯' },
    };

    const breadcrumbs = [
      { path: '/', label: 'Dashboard', emoji: '🏠', isLast: false }
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const config = breadcrumbMap[segment] || { label: segment, emoji: '📁' };
      const isLast = index === segments.length - 1;
      
      breadcrumbs.push({
        path: currentPath,
        label: config.label,
        emoji: config.emoji,
        isLast
      });
    });

    // Remove duplicate dashboard if we're on root
    if (location.pathname === '/') {
      return [{ path: '/', label: 'Dashboard', emoji: '🏠', isLast: true }];
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.path}>
            <BreadcrumbItem>
              {breadcrumb.isLast ? (
                <BreadcrumbPage className="flex items-center gap-1.5 font-medium text-primary">
                  <span>{breadcrumb.emoji}</span>
                  {breadcrumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  onClick={() => navigate(breadcrumb.path)}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                >
                  {index === 0 ? (
                    <Home className="h-4 w-4" />
                  ) : (
                    <span>{breadcrumb.emoji}</span>
                  )}
                  {breadcrumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!breadcrumb.isLast && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default AppBreadcrumbs;
