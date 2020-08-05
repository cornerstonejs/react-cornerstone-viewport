import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import './LoadingIndicator.css';

class LoadingIndicator extends PureComponent {
  static propTypes = {
    percentComplete: PropTypes.number.isRequired,
    error: PropTypes.object,
  };

  static defaultProps = {
    percentComplete: 0,
    error: null,
  };

  render() {
    const pc = this.props.percentComplete;
    const percComplete = `${pc}%`;

    return (
      <React.Fragment>
        {this.props.error ? (
          <div className="imageViewerErrorLoadingIndicator loadingIndicator">
            <div className="indicatorContents">
              <h4>Error Loading Image</h4>
              <p className="description">An error has occurred.</p>
              <p className="details">{this.props.error.message}</p>
            </div>
          </div>
        ) : (
          <div className="imageViewerLoadingIndicator loadingIndicator">
            <div className="indicatorContents">
              <h2>
                {pc < 100 ? 'Loading...' : 'Loaded -'}
                <i className="fa fa-spin fa-circle-o-notch fa-fw" />{' '}
              </h2>
              {pc === 100 && <p>Processing...</p>}
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default LoadingIndicator;
