// @flow
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { runTask, abortTask } from '../../actions';
import { getSelectedProjectId } from '../../reducers/projects.reducer';
import { getTaskByProjectIdAndTaskName } from '../../reducers/tasks.reducer';
import { COLORS } from '../../constants';
import { capitalize } from '../../utils';

import Pane from '../Pane';
import Toggle from '../Toggle';
import TerminalOutput from '../TerminalOutput';
import Paragraph from '../Paragraph';
import ExternalLink from '../ExternalLink';
import DevelopmentServerStatus from '../DevelopmentServerStatus';

import type { Task } from '../../types';

type Props = {
  task: ?Task,
  runTask: (task: Task, timestamp: Date) => void,
  abortTask: (task: Task, timestamp: Date) => void,
};

class DevelopmentServerPane extends PureComponent<Props> {
  handleToggle = (isToggled: boolean) => {
    const { task, runTask, abortTask } = this.props;

    if (!task) {
      // Should be impossible, since the Toggle control won't render without
      // a "start" task.
      return;
    }

    const timestamp = new Date();

    if (isToggled) {
      runTask(task, timestamp);
    } else {
      abortTask(task, timestamp);
    }
  };

  render() {
    const { task } = this.props;

    if (!task) {
      // TODO: Helpful error screen
      return 'No "start" task found. :(';
    }

    const isRunning = task.status !== 'idle';

    return (
      <Pane
        title="Dev Server"
        primaryActionChildren={
          <Toggle isToggled={isRunning} onToggle={this.handleToggle} />
        }
        leftSideChildren={
          <Fragment>
            <Description>
              Runs a local development server that updates whenever you make
              changes to the files.
            </Description>

            <DevelopmentServerStatus status={task.status} />

            <DocumentationLink>
              <ExternalLink
                color={COLORS.blue[700]}
                hoverColor={COLORS.blue[500]}
                href="https://github.com/facebook/create-react-app#user-guide"
              >
                View Documentation
              </ExternalLink>
            </DocumentationLink>
          </Fragment>
        }
        rightSideChildren={<TerminalOutput height={300} logs={task.logs} />}
      />
    );
  }
}

const DocumentationLink = styled.div`
  line-height: 35px;
  text-align: center;
`;

const Description = styled.div`
  font-size: 1.125rem;
`;

const mapStateToProps = state => {
  const selectedProjectId = getSelectedProjectId(state);

  // For now, I'm assuming that the dev server task will be named `start`.
  // This is not universally true, not even for Gatsby projects! So this will
  // need to be customizable (or at least based on type).
  const taskName = 'start';

  return {
    task: getTaskByProjectIdAndTaskName(selectedProjectId, taskName, state),
  };
};

const mapDispatchToProps = { runTask, abortTask };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DevelopmentServerPane);