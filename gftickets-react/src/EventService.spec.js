it('muestra mensaje cuando la lista está vacía', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => [],
  });

  render(<EventosComponent />);

  const mensaje = await screen.findByTestId('no-eventos');
  expect(mensaje).toBeInTheDocument();
});