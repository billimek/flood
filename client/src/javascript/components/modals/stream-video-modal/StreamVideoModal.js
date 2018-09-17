import {Button, Form, FormRow, Textbox} from 'flood-ui-kit';
import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import ConfigStore from '../../../stores/ConfigStore';
import Modal from '../Modal';
import UIActions from '../../../actions/UIActions';

const METHODS_TO_BIND = [
  'getStreamLink',
];

class StreamVideoModal extends React.Component {
  formRef = null;

  constructor() {
    super();

    this.state = {
      hash: null,
      file: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.setState({
      hash: this.props.options.hash,
      file: this.props.options.file,
    });
  }

  dismissModal() {
    UIActions.dismissModal();
  }

  getStreamLink() {
    const baseURI = ConfigStore.getBaseURI();
    const address = window.location.protocol + '//' + window.location.host;

    return `${address}${baseURI}stream/stream?hash=${this.state.hash}&file=${encodeURIComponent(this.state.file)}`;
  }

  handleCopyToClipboardClick = event => {
    event.preventDefault();
    let textField = document.createElement('textarea');
    textField.innerText = this.getStreamLink();
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
  };

  getActions() {
    return [
      {
        clickHandler: null,
        content: this.props.intl.formatMessage({
          id: 'button.cancel',
          defaultMessage: 'Cancel'
        }),
        triggerDismiss: true,
        type: 'tertiary'
      },
    ];
  }

  getContent() {
    return (
      <div className="modal__content inverse">
        <Form>
          <FormRow>
            <Textbox
              defaultValue={this.getStreamLink()}
              id="tags"
              placeholder={this.props.intl.formatMessage({
                id: 'torrents.set.tags.enter.tags',
                defaultMessage: 'Enter tags'
              })}
            />
            <Button onClick={this.handleCopyToClipboardClick}>
              <FormattedMessage
                id="button.copy.to.clipboard"
                defaultMessage="Copy to Clipboard"
              />
            </Button>
          </FormRow>
        </Form>
      </div>
    );
  }

  render() {
    return (
      <Modal actions={this.getActions()}
        content={this.getContent()}
        dismiss={this.props.dismiss}
        heading={this.props.intl.formatMessage({
          id: 'torrents.stream.video.heading',
          defaultMessage: 'Stream {name}',
        },{
          name: this.state.file
        })} />
    );
  }
}

export default injectIntl(StreamVideoModal);
