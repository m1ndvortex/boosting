import React, { useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardBody,
  Modal,
  ModalBody,
  ModalFooter,
  Badge,
  Avatar,
  Spinner,
  Sidebar,
  Header,
  Layout,
  MainContent,
  ContentArea
} from '../index';

export const ThemeDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      active: true
    },
    {
      id: 'services',
      label: 'My Services',
      icon: '🎮',
      badge: '3'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: '📋',
      children: [
        { id: 'pending', label: 'Pending', badge: '2' },
        { id: 'completed', label: 'Completed' }
      ]
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: '💰'
    }
  ];

  return (
    <Layout className="h-full">
      <div className="flex h-full">
        <Sidebar items={sidebarItems} collapsible />
        
        <div className="flex-1 flex flex-col">
          <Header
            title="Discord Theme Demo"
            subtitle="Showcasing all Discord-themed UI components"
            breadcrumbs={[
              { label: 'Home' },
              { label: 'Components' },
              { label: 'Theme Demo' }
            ]}
            actions={
              <div className="flex gap-sm">
                <Button variant="secondary" size="sm">
                  Settings
                </Button>
                <Button variant="primary" size="sm">
                  Save Changes
                </Button>
              </div>
            }
          />
          
          <MainContent>
            <ContentArea>
              <div className="discord-grid discord-grid--2 gap-lg">
                {/* Buttons Demo */}
                <Card>
                  <CardHeader>
                    <h3 className="text-primary">Buttons</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="discord-stack discord-stack--md">
                      <div className="discord-inline discord-inline--sm">
                        <Button variant="primary">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="success">Success</Button>
                        <Button variant="danger">Danger</Button>
                        <Button variant="ghost">Ghost</Button>
                      </div>
                      <div className="discord-inline discord-inline--sm">
                        <Button size="sm">Small</Button>
                        <Button size="md">Medium</Button>
                        <Button size="lg">Large</Button>
                      </div>
                      <div className="discord-inline discord-inline--sm">
                        <Button loading>Loading</Button>
                        <Button disabled>Disabled</Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Inputs Demo */}
                <Card>
                  <CardHeader>
                    <h3 className="text-primary">Inputs</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="discord-stack discord-stack--md">
                      <Input
                        label="Username"
                        placeholder="Enter your username"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                      />
                      <Input
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        leftIcon="📧"
                      />
                      <Input
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        rightIcon="👁️"
                        error="Password must be at least 8 characters"
                      />
                    </div>
                  </CardBody>
                </Card>

                {/* Badges & Avatars Demo */}
                <Card>
                  <CardHeader>
                    <h3 className="text-primary">Badges & Avatars</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="discord-stack discord-stack--md">
                      <div className="discord-inline discord-inline--sm">
                        <Badge variant="primary">Primary</Badge>
                        <Badge variant="success">Online</Badge>
                        <Badge variant="warning">Pending</Badge>
                        <Badge variant="danger">Error</Badge>
                      </div>
                      <div className="discord-inline discord-inline--sm">
                        <Avatar size="xs" fallback="XS" status="online" />
                        <Avatar size="sm" fallback="SM" status="idle" />
                        <Avatar size="md" fallback="MD" status="dnd" />
                        <Avatar size="lg" fallback="LG" status="offline" />
                        <Avatar size="xl" fallback="XL" />
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Modal Demo */}
                <Card>
                  <CardHeader>
                    <h3 className="text-primary">Modal & Spinner</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="discord-stack discord-stack--md">
                      <Button onClick={() => setIsModalOpen(true)}>
                        Open Modal
                      </Button>
                      <div className="discord-inline discord-inline--sm">
                        <Spinner size="xs" />
                        <Spinner size="sm" />
                        <Spinner size="md" />
                        <Spinner size="lg" />
                        <Spinner size="xl" />
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Color Palette Demo */}
                <Card className="discord-grid--2">
                  <CardHeader>
                    <h3 className="text-primary">Discord Color Palette</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="discord-grid discord-grid--3 gap-sm">
                      <div className="p-md rounded-md bg-primary text-center">
                        <div className="text-sm text-secondary">Primary</div>
                        <div className="text-xs text-muted">#2f3136</div>
                      </div>
                      <div className="p-md rounded-md bg-secondary text-center">
                        <div className="text-sm text-secondary">Secondary</div>
                        <div className="text-xs text-muted">#36393f</div>
                      </div>
                      <div className="p-md rounded-md bg-tertiary text-center">
                        <div className="text-sm text-secondary">Tertiary</div>
                        <div className="text-xs text-muted">#202225</div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Typography Demo */}
                <Card>
                  <CardHeader>
                    <h3 className="text-primary">Typography</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="discord-stack discord-stack--sm">
                      <h1 className="text-primary" style={{ fontSize: '28px', fontWeight: 700 }}>
                        Heading 1 - Bold
                      </h1>
                      <h2 className="text-primary" style={{ fontSize: '24px', fontWeight: 600 }}>
                        Heading 2 - Semibold
                      </h2>
                      <h3 className="text-primary" style={{ fontSize: '20px', fontWeight: 500 }}>
                        Heading 3 - Medium
                      </h3>
                      <p className="text-secondary">
                        Body text - Secondary color with normal weight
                      </p>
                      <p className="text-muted" style={{ fontSize: '14px' }}>
                        Small text - Muted color for less important information
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </ContentArea>
          </MainContent>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Discord Modal Demo"
        size="md"
      >
        <ModalBody>
          <div className="discord-stack discord-stack--md">
            <p className="text-secondary">
              This is a Discord-themed modal component with proper styling and animations.
            </p>
            <Input
              label="Modal Input"
              placeholder="Type something..."
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </Layout>
  );
};