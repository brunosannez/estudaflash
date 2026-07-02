
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MindMapData, MindMapNode } from '@/hooks/useMindMap';

interface MindMapViewerProps {
  mindMapData: MindMapData;
  onBack?: () => void;
}

const MindMapViewer = ({ mindMapData, onBack }: MindMapViewerProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const renderMindMap = () => {
    if (!svgRef.current || !mindMapData.nodes) return;

    const svg = svgRef.current;
    const width = 1000;
    const height = 600;
    
    // Clear previous content safely (avoid innerHTML for security)
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Create a map of nodes by ID
    const nodeMap = new Map<string, MindMapNode>();
    mindMapData.nodes.forEach(node => {
      nodeMap.set(node.id, node);
    });

    // Calculate positions for nodes
    const positions = new Map<string, { x: number; y: number }>();
    const levelGroups = new Map<number, MindMapNode[]>();
    
    // Group nodes by level
    mindMapData.nodes.forEach(node => {
      if (!levelGroups.has(node.level)) {
        levelGroups.set(node.level, []);
      }
      levelGroups.get(node.level)!.push(node);
    });

    // Position nodes
    const centerX = width / 2;
    const centerY = height / 2;
    const levelSpacing = 120;
    
    levelGroups.forEach((nodes, level) => {
      if (level === 0) {
        // Center node
        positions.set(nodes[0].id, { x: centerX, y: centerY });
      } else {
        const angleStep = (2 * Math.PI) / nodes.length;
        nodes.forEach((node, index) => {
          const angle = index * angleStep;
          const radius = level * levelSpacing;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          positions.set(node.id, { x, y });
        });
      }
    });

    // Draw connections
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'connectionGradient');
    gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#3B82F6');
    stop1.setAttribute('stop-opacity', '0.8');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#8B5CF6');
    stop2.setAttribute('stop-opacity', '0.4');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    mindMapData.nodes.forEach(node => {
      if (node.children) {
        node.children.forEach(childId => {
          const parentPos = positions.get(node.id);
          const childPos = positions.get(childId);
          
          if (parentPos && childPos) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', parentPos.x.toString());
            line.setAttribute('y1', parentPos.y.toString());
            line.setAttribute('x2', childPos.x.toString());
            line.setAttribute('y2', childPos.y.toString());
            line.setAttribute('stroke', 'url(#connectionGradient)');
            line.setAttribute('stroke-width', '3');
            line.setAttribute('stroke-linecap', 'round');
            svg.appendChild(line);
          }
        });
      }
    });

    // Draw nodes
    mindMapData.nodes.forEach(node => {
      const pos = positions.get(node.id);
      if (!pos) return;

      // Node background circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x.toString());
      circle.setAttribute('cy', pos.y.toString());
      circle.setAttribute('r', (80 - node.level * 10).toString());
      circle.setAttribute('fill', node.color);
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '3');
      circle.setAttribute('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))');
      circle.style.cursor = 'pointer';
      
      // Add hover effect
      circle.addEventListener('mouseenter', () => {
        circle.setAttribute('r', (85 - node.level * 10).toString());
      });
      circle.addEventListener('mouseleave', () => {
        circle.setAttribute('r', (80 - node.level * 10).toString());
      });
      
      svg.appendChild(circle);

      // Node text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x.toString());
      text.setAttribute('y', pos.y.toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', '#ffffff');
      text.setAttribute('font-size', (16 - node.level * 2).toString());
      text.setAttribute('font-weight', 'bold');
      text.style.pointerEvents = 'none';
      
      // Handle long text
      const words = node.text.split(' ');
      if (words.length > 2) {
        const tspan1 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan1.setAttribute('x', pos.x.toString());
        tspan1.setAttribute('dy', '-0.3em');
        tspan1.textContent = words.slice(0, 2).join(' ');
        
        const tspan2 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan2.setAttribute('x', pos.x.toString());
        tspan2.setAttribute('dy', '1.2em');
        tspan2.textContent = words.slice(2).join(' ');
        
        text.appendChild(tspan1);
        text.appendChild(tspan2);
      } else {
        text.textContent = node.text;
      }
      
      svg.appendChild(text);
    });
  };

  useEffect(() => {
    renderMindMap();
  }, [mindMapData]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white via-primary/20 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950">
        <CardHeader className="bg-primary text-white relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <CardTitle className="flex items-center gap-4 text-3xl">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="block text-3xl font-bold">{mindMapData.title}</span>
                <span className="block text-lg font-normal text-white/80 mt-1">Mapa Mental Interativo</span>
              </div>
            </CardTitle>
            
            {onBack && (
              <Button 
                onClick={onBack}
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="bg-card dark:bg-gray-800 rounded-2xl shadow-inner border-2 border-border dark:border-gray-700 overflow-hidden">
            <svg
              ref={svgRef}
              width="100%"
              height="600"
              viewBox="0 0 1000 600"
              className="w-full h-auto"
              style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
            >
            </svg>
          </div>
          
          {/* Legend */}
          <div className="mt-6 p-4 bg-muted/50 dark:from-gray-800 dark:to-blue-900 rounded-xl">
            <h4 className="text-lg font-semibold text-foreground dark:text-gray-200 mb-3">Legenda:</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary/50 rounded-full"></div>
                <span className="text-foreground/80 dark:text-gray-300">Conceito Central</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-foreground/80 dark:text-gray-300">Tópicos Principais</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-foreground/80 dark:text-gray-300">Subtópicos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-foreground/80 dark:text-gray-300">Detalhes</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MindMapViewer;
